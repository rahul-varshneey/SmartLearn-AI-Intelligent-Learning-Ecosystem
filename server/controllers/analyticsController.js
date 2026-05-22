const Analytics = require('../models/Analytics');

const getUserAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ userId: req.user.id });
    
    if (!analytics) {
      analytics = await Analytics.create({ userId: req.user.id });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

module.exports = {
  getUserAnalytics
};
