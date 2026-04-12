const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'tripId is required'],
      index: true,
    },

    // Name of the member who paid (matches Trip.members[].name)
    paidBy: {
      type: String,
      required: [true, 'paidBy is required'],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    // Names of members who share this expense
    participants: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'At least one participant is required',
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // Split strategy — only "equal" for MVP; extensible for future modes
    splitMode: {
      type: String,
      enum: ['equal'],
      default: 'equal',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: per-person share amount (equal split only)
expenseSchema.virtual('sharePerPerson').get(function () {
  if (!this.participants || this.participants.length === 0) return 0;
  return parseFloat((this.amount / this.participants.length).toFixed(2));
});

module.exports = mongoose.model('Expense', expenseSchema);
