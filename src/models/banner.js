const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the banner'],
    },
    image: {
      type: String,
      required: [true, 'Please provide an image for the banner'],
      default: '01.png',
    },
    textPosition: {
      type: String,
      default: 'right',
      enum: ['left', 'right'],
    },
    textHeader: {
      type: String,
      default: 'free home delivery within 24 hours now.',
    },
    textContent: {
      type: String,
      default:
        'Did you ever imagine that the freshest of fruits and vegetables, top quality pulses and food grains, dairy products and hundreds of branded items could be handpicked and delivered to your home, all at the click of a button? India’s first comprehensive online megastore, greeny.com, brings a whopping 20000+ products with more than 1000 brands, to over 4 million happy customers.',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
