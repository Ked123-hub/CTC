import mongoose from "mongoose";

const { Schema } = mongoose;

// Inventory Log Sub-schema
const inventoryLogSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker'
  },
  changeQty: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ["ISSUED", "RETURNED", "DAMAGED", "LOST", "PURCHASED", "ADJUSTMENT", "OTHER"],
    default: "OTHER"
  },
  notes: {
    type: String,
    trim: true
  },
  previousQty: {
    type: Number,
    required: true
  },
  newQty: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main Inventory Schema
const inventorySchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  itemName: {
    type: String,
    required: true,
    maxlength: 150,
    trim: true
  },
  category: {
    type: String,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantityAvailable: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  quantityReserved: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    enum: ["PIECES", "KG", "LITERS", "METERS", "BOXES", "PACKS", "OTHER"],
    default: "PIECES",
    maxlength: 30
  },
  location: {
    type: String,
    maxlength: 150,
    trim: true
  },
  minimumStock: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumStock: {
    type: Number,
    min: 0
  },
  supplier: {
    name: {
      type: String,
      maxlength: 100
    },
    contact: {
      type: String,
      maxlength: 100
    }
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "DISCONTINUED"],
    default: "ACTIVE"
  },
  // Embedded logs
  logs: [inventoryLogSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
inventorySchema.index({ projectId: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ itemName: 1 });
inventorySchema.index({ status: 1 });

// Virtual for available quantity (total - reserved)
inventorySchema.virtual('availableQty').get(function() {
  return this.quantityAvailable - this.quantityReserved;
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.quantityAvailable <= this.minimumStock) return 'LOW_STOCK';
  if (this.maximumStock && this.quantityAvailable >= this.maximumStock) return 'OVERSTOCK';
  return 'NORMAL';
});

// Pre-save middleware to update logs
inventorySchema.pre('save', function(next) {
  if (this.isModified('quantityAvailable') && !this.isNew) {
    // This would be handled in the service layer for proper logging
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
