import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
    role: "user" | "model";
    parts: { text: string }[];
    timestamp: Date;
}

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    messages: IMessage[];
    updatedAt: Date;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ["user", "model"], required: true },
    parts: [{
        text: { type: String, required: true }
    }],
    timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        messages: [MessageSchema],
    },
    { timestamps: true }
);

// Compound index to quickly find the specific chat for a user on a given question
ChatSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
