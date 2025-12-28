import { Router } from 'express';
import { db } from '../db';
import { orderMessages, orders, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendOrderMessageEmail } from '../services/email';
import { z } from 'zod';

const router = Router();

// Validation schema for creating a message
const createMessageSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

/**
 * GET /api/orders/:orderId/messages
 * Get all messages for an order
 */
router.get('/orders/:orderId/messages', async (req, res) => {
    try {
        const { orderId } = req.params;
        const authUser = req.user as any;
        const userId = authUser.id;
        const isAdmin = authUser.isAdmin;

        // Verify the order exists and user has access
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check access: admin can see all, customer can only see their own
        if (!isAdmin && order.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Fetch all messages for this order
        const messages = await db.query.orderMessages.findMany({
            where: eq(orderMessages.orderId, orderId),
            orderBy: [desc(orderMessages.createdAt)],
            with: {
                user: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching order messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /api/orders/:orderId/messages
 * Create a new message for an order
 */
router.post('/orders/:orderId/messages', async (req, res) => {
    try {
        const { orderId } = req.params;
        const authUser = req.user as any;
        const userId = authUser.id;
        const isAdmin = authUser.isAdmin;

        // Validate request body
        const validation = createMessageSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Invalid request',
                errors: validation.error.errors,
            });
        }

        const { message } = validation.data;

        // Verify the order exists and user has access
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                user: {
                    columns: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check access: admin can message any order, customer can only message their own
        if (!isAdmin && order.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Create the message
        const [newMessage] = await db.insert(orderMessages).values({
            orderId,
            userId,
            message,
            isAdminMessage: isAdmin,
        }).returning();

        // Send email notification
        try {
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5050';
            const recipientEmail = isAdmin ? order.user?.email : process.env.ADMIN_EMAIL;
            const orderLink = isAdmin
                ? `${clientUrl}/order/${order.orderNumber}`
                : `${clientUrl}/admin/orders/${orderId}`;

            if (recipientEmail) {
                await sendOrderMessageEmail({
                    to: recipientEmail,
                    orderNumber: order.orderNumber,
                    customerName: order.user?.firstName || order.user?.email || 'Cliente',
                    message,
                    isAdminMessage: isAdmin,
                    orderLink,
                });

                // Update email sent status
                await db.update(orderMessages)
                    .set({
                        emailSent: true,
                        emailSentAt: new Date(),
                    })
                    .where(eq(orderMessages.id, newMessage.id));
            }
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // Don't fail the request if email fails
        }

        // Fetch the complete message with user data
        const completeMessage = await db.query.orderMessages.findFirst({
            where: eq(orderMessages.id, newMessage.id),
            with: {
                user: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({ message: completeMessage });
    } catch (error) {
        console.error('Error creating order message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/orders/:orderId/messages/unread-count
 * Get count of unread messages (for future implementation with read receipts)
 */
router.get('/orders/:orderId/messages/unread-count', async (req, res) => {
    try {
        const { orderId } = req.params;
        const authUser = req.user as any;
        const userId = authUser.id;
        const isAdmin = authUser.isAdmin;

        // Verify access
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!isAdmin && order.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // For now, return 0 - can be enhanced later with read receipts
        res.json({ unreadCount: 0 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
