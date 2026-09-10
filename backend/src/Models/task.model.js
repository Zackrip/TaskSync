import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ["SCHEDULED", "IN PROGRESS", "COMPLETED"],
        default: "SCHEDULED",
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    dueDate: {
        type: Date,
        required: true,
    },
},
 { timestamps: true } 
);

const Task = mongoose.model("Task", taskSchema);

export default Task;