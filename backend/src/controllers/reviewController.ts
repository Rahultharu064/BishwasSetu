import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

// Create a review (Customer only)
export const createReview = async (req: Request, res: Response) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ message: "Booking ID, rating (1-5), and comment are required" });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    // Validate the booking exists, belongs to the customer, and is COMPLETED
    const booking = await prismaClient.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId !== customerId) {
      return res.status(403).json({ message: "You can only review bookings you created" });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }

    // Check if review already exists for this booking
    const existingReview = await prismaClient.review.findFirst({
      where: { bookingId: booking.id },
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    // Create the review
    const review = await prismaClient.review.create({
      data: {
        bookingId: booking.id,
        customerId,
        providerId: booking.providerId,
        rating: ratingNum,
        comment,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Trigger Trust Score recalculation here

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

// Get reviews for a provider (Public)
export const getProviderReviews = async (req: Request, res: Response) => {
  try {
    const providerId = parseInt(req.params.id);
    if (isNaN(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    const reviews = await prismaClient.review.findMany({
      where: { providerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Get provider reviews error:", error);
    res.status(500).json({ message: "Failed to retrieve reviews" });
  }
};

// Reply to a review (Provider only)
export const replyToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Review UUID
    const { reply } = req.body;
    const providerUserId = req.user?.id;

    if (!providerUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: "Reply text is required" });
    }

    // Find the review and verify the provider owns it
    const review = await prismaClient.review.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.provider.userId !== providerUserId) {
      return res.status(403).json({ message: "You can only reply to reviews on your profile" });
    }

    const updatedReview = await prismaClient.review.update({
      where: { id },
      data: { reply },
    });

    res.json({
      message: "Reply added successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Reply to review error:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
};
