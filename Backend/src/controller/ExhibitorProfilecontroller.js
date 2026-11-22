const Exhibitor = require("../model/exhibitorProfilemodel");
const User = require("../model/Usermodel");
const Booth = require("../model/boothmodel");
const ExpoApplication = require("../model/exhibitorApplicationmodel");
const { isValidHttpUrl } = require("../services/validation");
const { deleteUserCascade } = require("../services/deleteUserCascade");


const CreateExhibitor = async (req, res) => {
    try {
        const { CompanyName, description, products, services, website, contactEmail, phone, category } = req.body;

        const userId = req.user.id;

        if (!isValidHttpUrl(website)) {
            return res.status(400).json({ message: "Website must be a valid URL starting with http:// or https://" });
        }

        const logoFile = req.files?.image?.[0];
        const documentFiles = req.files?.documents || [];

        const logoUrl = logoFile
            ? `/uploads/exhibitor/${logoFile.filename}`
            : undefined;

        const documentUrls = documentFiles.map((file) => `/uploads/exhibitor/${file.filename}`);


        const existing = await Exhibitor.findOne({ UserId: userId });
        if (existing) return res.status(400).json({ message: "You already have a company profile" });
        const account = await User.findById(userId).select("email");
        const createExhibitor = new Exhibitor({
            CompanyName,
            description,
            products,
            services,
            website: website || undefined,
            category,
            logoUrl,
            contactEmail: contactEmail || account?.email,
            phone: phone || undefined,
            documents: documentUrls,
            UserId: userId,
        })

        await createExhibitor.save();
        return res.status(201).json({
            message: "Profile Create Successfully",
            data: createExhibitor
        })
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const getExhibitor = async (req, res) => {
    try {
        const exhibitors = await Exhibitor.find()
            .select("-documents")
            .populate("UserId", "name email phone approvalStatus IsBlocked IsActive isEmailVerified createdAt")
            .sort({ CompanyName: 1 })
            .lean();

        const userIds = exhibitors
            .map((exhibitor) => exhibitor.UserId?._id)
            .filter(Boolean);

        const [boothCounts, applicationCounts] = userIds.length
            ? await Promise.all([
                Booth.aggregate([
                    { $match: { exhibitorId: { $in: userIds } } },
                    { $group: { _id: "$exhibitorId", count: { $sum: 1 } } },
                ]),
                ExpoApplication.aggregate([
                    { $match: { exhibitorId: { $in: userIds } } },
                    { $group: { _id: "$exhibitorId", count: { $sum: 1 } } },
                ]),
            ])
            : [[], []];

        const boothCountByUser = new Map(boothCounts.map((item) => [item._id.toString(), item.count]));
        const applicationCountByUser = new Map(
            applicationCounts.map((item) => [item._id.toString(), item.count])
        );

        const data = exhibitors.map((exhibitor) => {
            const userId = exhibitor.UserId?._id?.toString();
            return {
                ...exhibitor,
                boothCount: userId ? boothCountByUser.get(userId) || 0 : 0,
                applicationCount: userId ? applicationCountByUser.get(userId) || 0 : 0,
            };
        });

        return res.status(200).json(data)
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const searchExhibitor = async (req, res) => {
    try {
        const { search } = req.query;
        const filter = search
            ? {
                $or: [
                    { CompanyName: { $regex: search, $options: "i" } },
                    { products: { $regex: search, $options: "i" } },
                    { services: { $regex: search, $options: "i" } }
                ]
            }
            : {};

        if (req.query.category) filter.category = req.query.category;
        const exhibitors = await Exhibitor.find(filter).select("-documents").populate("UserId", "name email profileImage");
        return res.status(200).json(exhibitors);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const editExhibitor = async (req, res) => {
    try {
        const { id } = req.params;

        const existingexhibiitor = await Exhibitor.findById(id);

        if (!existingexhibiitor) {
            return res.status(404).json({ message: "Exhibitor profile not found" });
        }

        if (
            req.user.role !== "admin" &&
            existingexhibiitor.UserId.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const { CompanyName, description, products, services, website, contactEmail, phone, category } = req.body;

        if (!isValidHttpUrl(website)) {
            return res.status(400).json({ message: "Website must be a valid URL starting with http:// or https://" });
        }

        let updatedata = { CompanyName, description, products, services, website, contactEmail, phone, category }

        const logoFile = req.files?.image?.[0];
        const documentFiles = req.files?.documents || [];

        if (logoFile) {
            updatedata.logoUrl = `/uploads/exhibitor/${logoFile.filename}`;
        }

        if (documentFiles.length > 0) {
            const existingDocuments = Array.isArray(existingexhibiitor.documents)
                ? existingexhibiitor.documents
                : existingexhibiitor.documents
                    ? [existingexhibiitor.documents]
                    : [];

            updatedata.documents = [
                ...existingDocuments,
                ...documentFiles.map((file) => `/uploads/exhibitor/${file.filename}`)
            ];
        }

        updatedata.UpdatedAt = Date.now();
        const updateExhibitor = await Exhibitor.findByIdAndUpdate(id, updatedata, { returnDocument: "after", runValidators: true });

        return res.status(200).json({ message: "Data Update Successfully", data: updateExhibitor })
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

const deleteExhibitor = async (req, res) => {
    try {
        const { id } = req.params;

        const existingexhibiitor = await Exhibitor.findById(id);

        if (!existingexhibiitor) {
            return res.status(404).json({ message: "Exhibitor profile not found" });
        }

        const isAdmin = req.user.role === "admin";

        if (
            !isAdmin &&
            existingexhibiitor.UserId.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: "You can only delete your own profile" });
        }

        // Organizers remove the exhibitor account itself so the user can no
        // longer sign in and no orphaned records are left behind. Exhibitors
        // deleting their own profile only remove the company profile.
        if (isAdmin && existingexhibiitor.UserId) {
            const result = await deleteUserCascade(existingexhibiitor.UserId);
            return res.status(200).json({
                message: "Exhibitor account deleted successfully",
                ...result,
            });
        }

        await Exhibitor.findByIdAndDelete(id);

        res.status(200).json({ message: "Profile Deleted Successfully" })
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}


module.exports = { CreateExhibitor, getExhibitor, searchExhibitor, editExhibitor , deleteExhibitor }
