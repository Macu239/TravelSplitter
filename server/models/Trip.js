const mongoose = require('mongoose');

// Embedded member subdocument — stores name + optional userId reference.
// For MVP we support name-only members (no auth required).
const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    // Optional link to a registered User document (post-MVP auth)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      minlength: [1, 'Trip name must be at least 1 character'],
      maxlength: [100, 'Trip name cannot exceed 100 characters'],
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'A trip must have at least one member',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: convenience list of member names
tripSchema.virtual('memberNames').get(function () {
  return this.members.map((m) => m.name);
});

module.exports = mongoose.model('Trip', tripSchema);
