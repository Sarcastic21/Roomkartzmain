import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/UserModel.js";
import verifyToken  from "../middleware/auth.js"; // Ensure the correct file extension
import twilio from 'twilio';

const saltRounds = 10;
const router = express.Router();



const SECRET_KEY = process.env.JWT_SECRET_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
let otpStore = {}; 

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);
// In-memory OTP store (replace with Redis in production)



// Send OTP via SMS
router.post('/send-otp2', async (req, res) => {
  const { mobile } = req.body;
  
  // Validate mobile number
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number' });
  }

  const formattedMobile = `+91${mobile}`; // Add Indian country code
  const otp = generateOtp();

  // Set OTP expiry (5 minutes)
  otpStore[formattedMobile] = { 
    otp, 
    expires: Date.now() + 300000,
    attempts: 0 
  };

  try {
    await client.messages.create({
      body: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
      from: twilioPhone,
      to: formattedMobile
    });
    
    res.status(200).json({ message: 'OTP sent to your mobile' });
  } catch (error) {
    console.error('Twilio error:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }
    if (error.code === 21614) {
      return res.status(400).json({ message: 'This number is not mobile-capable' });
    }
    
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.message 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;
  
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Invalid mobile number' });
  }
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Invalid OTP format' });
  }

  const formattedMobile = `+91${mobile}`;
  const storedOtp = otpStore[formattedMobile];

  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP expired or not requested' });
  }

  // Increment attempt counter
  storedOtp.attempts += 1;

  if (storedOtp.attempts > 5) {
    delete otpStore[formattedMobile];
    return res.status(400).json({ message: 'Too many attempts. Please request a new OTP' });
  }

  if (Date.now() > storedOtp.expires) {
    delete otpStore[formattedMobile];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP verified successfully
  delete otpStore[formattedMobile];
  res.status(200).json({ message: 'OTP verified successfully' });
});

// Register User
router.post('/register', async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ name, email, mobile, password: hashedPassword, role });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error during user registration:", err);
    res.status(500).json({ message: 'Error registering user' });
  }
});



// Login user

router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Set user as active
    user.isActive = true;
    await user.save();

    // ✅ Create JWT with 48h expiration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' } // Token valid for 48 hours
    );

    // ✅ Decode the token to get expiry time
    const decoded = jwt.decode(token); // Only decodes the payload (doesn't verify)

    res.json({
      message: 'Login successful',
      token,
      user,
      expiresAt: decoded.exp * 1000 // Convert to milliseconds for frontend use
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    // Set user as inactive
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name mobile role isActive'); // Fetch only required fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});



router.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid 10-digit mobile number",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  try {
    // Match number without +91 in DB
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this mobile number",
      });
    }

    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP with +91 prefix
    await client.messages.create({
      body: `Your password reset OTP is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: `+91${mobile}`,
    });

    res.json({
      success: true,
      message: "OTP sent to your mobile number",
    });
  } catch (error) {
    console.error("Twilio error:", error);

    let errorMessage = "Failed to send OTP";
    if (error.code === 21211) errorMessage = "Invalid mobile number";
    if (error.code === 21614) errorMessage = "This number cannot receive SMS";

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
});

// ✅ Reset Password
router.post("/forgot-password", async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number" });
  }
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "Invalid OTP format" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

// Profile Route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ status: 'success', user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
router.get("/my-properties", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("properties");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ properties: user.properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // your app password
  },
});
router.post("/add-property", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      address,
      near,
      description,
      rent,
      gender,
      furnishing,
      restriction,
      images,
      status,
      wifi,
      ac,
      waterSupply,
      powerBackup,
      security,
    } = req.body;

    const newProperty = {
      address,
      near,
      description,
      rent,
      gender,
      furnishing,
      restriction,
      images,
      status: status || "Open",
      wifi,
      ac,
      waterSupply,
      powerBackup,
      security,
    };

    user.properties.push(newProperty);
    await user.save();

    // Send email to notify about the new property
    const mailOptions = {
      from: '"Property Notifier" <itsayushmaurya991@gmail.com>',
      to: "ayushmaurya3596@gmail.com",
      subject: "New Property Registered",
      html: `
        <h2>New Property Details</h2>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Rent:</strong> ₹${rent}</p>
        <p><strong>Rent:</strong> ₹${near}</p>

        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Furnishing:</strong> ${furnishing}</p>
        <p><strong>Restriction:</strong> ${restriction}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Amenities:</strong> 
          ${wifi ? "WiFi, " : ""} 
          ${ac ? "AC, " : ""} 
          ${waterSupply ? "Water Supply, " : ""} 
          ${powerBackup ? "Power Backup, " : ""} 
          ${security ? "Security" : ""}
        </p>
        <p><strong>Submitted By:</strong> ${user.name} (${user.email})</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ status: "success", property: newProperty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add property" });
  }
});

router.get("/properties", async (req, res) => {
  try {
    // Get all users with their properties
    const users = await User.find({}, "properties");

    // Flatten and merge all properties into one array
    const allProperties = users.flatMap(user => user.properties);

    res.status(200).json(allProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Update property by ID
// PUT /api/users/:id


// Update a specific property of the user
router.put("/update-property/:propertyId", verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rent, status } = req.body;

    // Validate input
    if (rent === undefined && status === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (rent !== undefined && (isNaN(rent) || rent <= 0)) {
      return res.status(400).json({ error: "Invalid rent amount" });
    }

    if (status && !["Open", "Closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find user and the specific property
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const propertyIndex = user.properties.findIndex(
      p => p._id.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Update the property fields
    if (rent !== undefined) {
      user.properties[propertyIndex].rent = rent;
    }
    if (status !== undefined) {
      user.properties[propertyIndex].status = status;
    }

    await user.save();

    res.status(200).json(user.properties[propertyIndex]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update property" });
  }
});


router.delete("/delete-property/:propertyId", verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find the user making the request
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find index of the property to delete
    const propertyIndex = user.properties.findIndex(
      (p) => p._id.toString() === propertyId
    );

    if (propertyIndex === -1) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Remove property from user's properties
    user.properties.splice(propertyIndex, 1);
    
    await user.save();

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

export default router;
