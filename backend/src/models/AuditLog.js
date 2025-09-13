const mongoose = require('mongoose');


const AuditLogSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
action: { type: String, required: true },
meta: { type: Object },
ip: String
}, { timestamps: true });


module.exports = mongoose.model('AuditLog', AuditLogSchema);