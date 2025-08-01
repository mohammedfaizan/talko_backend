import { Webhook } from "svix";
import User from "../models/userModel.js";
import "dotenv/config";

const handleClerkWebhook = async (req, res) => {
  console.log("User Creation");
  try {
    console.log("hello");
    const CLERK_WEBHOOK_SECRET_KEY = process.env.CLERK_WEBHOOK_SECRET_KEY;
    if (!CLERK_WEBHOOK_SECRET_KEY) {
      console.error("X Error: CLERK_WEBHOOK_SECRET_KEY");
      return res.status(500).json({ success: false, message: "server error" });
    }
    console.log(CLERK_WEBHOOK_SECRET_KEY);
    const svixHeaders = req.headers;
    const payloadString = req.body;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
    console.log(wh);
    const evt = wh.verify(payloadString, svixHeaders);

    console.log(evt);

    //destructure the event data, extracting the id field and putting all other fields into an attributes object
    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    console.log(`Recieved webhood: id ${id}, event Type: ${eventType}`);
    console.log("Payload Data/Attributes: ", attributes);

    if (eventType === "user.created") {
      console.log("user created triggered");
      const userExists = await User.findOne({ clerkUserId: id });
      console.log("User : ", userExists);

      if (!userExists) {
        try {
          let email = "";
          if (
            Array.isArray(attributes.email_addresses) &&
            attributes.email_addresses.length > 0 &&
            attributes.email_addresses[0].email_address
          ) {
            email = attributes.email_addresses[0].email_address;
          }

          if (!email) {
            console.warn("No email found for user, skipping creation:", id);
          }
          const newUser = new User({
            clerkUserId: id,
            email: email,
            userName: attributes.username,
            firstName: attributes.first_name || "",
            lastName: attributes.last_name || "",
            profileImage: attributes.image_url || "",
          });

          await newUser.save();
          console.log("user saved to mongodb", newUser);
          res.status(200).json({ success: true, message: "user created" });
        } catch (error) {
          res
            .status(500)
            .json({ success: true, message: "failed to create user" });
        }
      } else {
        console.log("user already exists in mongodb");
      }
    } else if (eventType === "user.updated") {
      try {
        const updateUser = await User.updateOne(
          { clerkUserId: id },
          {
            $set: {
              email: attributes.email_addresses[0].email_address,
              firstName: attributes.first_name,
              lastName: attributes.last_name,
              userName: attributes.username,
              profileImage: attributes.profile_image_url,
            },
          }
        );

        if (updateUser.modifiedCount > 0) {
          console.log(`User with clerkUserId: ${id} updated successfully`);
        } else {
          console.log(`No user with clerkUserId${id}`);
        }
        res
          .status(200)
          .json({ success: false, message: "user updated successfully" });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, message: "user is not updated" });
      }
    } else if (eventType === "user.deleted") {
      try {
        const deletedUser = await User.deleteOne({ clerkUserId: id });

        if (deletedUser.deletedCount > 0) {
          console.log(`User with clerkUserId ${id} deleted successfully`);
          res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });
        } else {
          console.log(`No user with clerkUserId ${id}`);
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Something went wrong while deleting",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//getUsers for sidebar
const getUsersForSidebar = async (req, res) => {
  try {
    console.log("getUsersForSidebar called");
    const currentUser = req.auth?.userId;

    const filteredUsers = await User.find({
      clerkUserId: { $ne: currentUser },
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { handleClerkWebhook, getUsersForSidebar };
