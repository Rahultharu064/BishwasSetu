import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { providerId, serviceId, bookingDate, notes } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if provider exists and is verified
    const provider = await prismaClient.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.verificationStatus !== "VERIFIED") {
      return res.status(400).json({ message: "Provider is not verified and cannot accept bookings" });
    }

    // Check if service exists and belongs to the provider
    const service = await prismaClient.service.findFirst({
      where: {
        id: serviceId,
        providerId: providerId,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found or doesn't belong to this provider" });
    }

    // Create the booking
    const booking = await prismaClient.booking.create({
      data: {
        customerId,
        providerId,
        serviceId,
        bookingDate: new Date(bookingDate),
        notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await prismaClient.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            district: true,
            municipality: true,
          },
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            category: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is authorized to view this booking
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (
      userRole !== "ADMIN" &&
      booking.customerId !== userId &&
      booking.provider.userId !== userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

// Get bookings for customer
export const getCustomerBookings = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const bookings = await prismaClient.booking.findMany({
      where: { customerId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            category: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get customer bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get bookings for provider
export const getProviderBookings = async (req: Request, res: Response) => {
  try {
    const providerUserId = req.user?.id;

    if (!providerUserId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Get provider record
    const provider = await prismaClient.provider.findUnique({
      where: { userId: providerUserId },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const bookings = await prismaClient.booking.findMany({
      where: { providerId: provider.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            district: true,
            municipality: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get provider bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the booking
    const booking = await prismaClient.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check permissions: only provider or admin can update status
    if (userRole !== "ADMIN" && booking.provider.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update the booking status
    const updatedBooking = await prismaClient.booking.update({
      where: { id: bookingId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};
