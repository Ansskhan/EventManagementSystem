const User = require("../model/Usermodel");
const Exhibitor = require("../model/exhibitorProfilemodel");
const ExpoRegistration = require("../model/expoRegistrationsmodel");
const SessionRegistration = require("../model/SessionRegistrationmodel");
const Feedback = require("../model/Feedbackmodel");
const Message = require("../model/Messagemodel");
const Notification = require("../model/Notificationmodel");
const Bookmark = require("../model/Bookmarkmodel");
const ExpoApplication = require("../model/exhibitorApplicationmodel");
const Booth = require("../model/boothmodel");
const Session = require("../model/Sessionmodel");

/**
 * Delete a user together with every record owned by them.
 *
 * This keeps the database consistent when an organizer removes an account:
 * the exhibitor profile, applications, booth assignments, sessions, and
 * attendee-side records are all cleaned up so nothing is left pointing at a
 * user that no longer exists.
 *
 * @param {import("mongoose").Types.ObjectId|string} userId
 * @returns {Promise<{sessionsRemoved: number}>}
 */
async function deleteUserCascade(userId) {
    const ownedSessions = await Session.find({ exhibitorId: userId }).select("_id").lean();
    const sessionIds = ownedSessions.map((session) => session._id);

    await Promise.all([
        Exhibitor.deleteMany({ UserId: userId }),
        ExpoRegistration.deleteMany({ attendeeId: userId }),
        SessionRegistration.deleteMany({ attendeeId: userId }),
        sessionIds.length
            ? SessionRegistration.deleteMany({ sessionId: { $in: sessionIds } })
            : Promise.resolve(),
        Feedback.deleteMany({ userId }),
        Bookmark.deleteMany({ attendeeId: userId }),
        Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
        Notification.deleteMany({ userId }),
        ExpoApplication.deleteMany({ $or: [{ exhibitorId: userId }, { reviewedBy: userId }] }),
        Session.deleteMany({ exhibitorId: userId }),
        Booth.updateMany(
            { exhibitorId: userId },
            { $set: { exhibitorId: null, status: "available", updatedAt: Date.now() } }
        ),
        Booth.updateMany({ requestedBy: userId }, { $pull: { requestedBy: userId } }),
    ]);

    await User.findByIdAndDelete(userId);

    return { sessionsRemoved: sessionIds.length };
}

module.exports = { deleteUserCascade };
