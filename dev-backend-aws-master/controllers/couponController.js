const Coupon = require('../models/couponModel')

// create, remove, list

exports.createCoupon = async (req, res) => {
  try {
    // console.log(req.body);
    // return;
    const { name, expiry, discount } = req.body.coupon
    res.json(await new Coupon({ name, expiry, discount }).save())
  } catch (err) {
    console.log(err)
  }
}

exports.deleteCoupon = async (req, res) => {
  try {
    res.json(await Coupon.findByIdAndDelete(req.params.couponId).exec())
  } catch (err) {
    console.log(err)
  }
}

exports.getAllCoupons = async (req, res) => {
  try {
    res.json(await Coupon.find({}).sort({ createdAt: -1 }).exec())
  } catch (err) {
    console.log(err)
  }
}
