package com.campusoperationsmanager.backend.ticket.exception;

// A custom exception specific to ticket operations
// Extends RuntimeException so Spring can catch it automatically
public class TicketException extends RuntimeException {

    private final int statusCode;

    public TicketException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }

    // Factory methods - makes code readable: throw TicketException.notFound(id)
    public static TicketException notFound(Long id) {
        return new TicketException("Ticket not found with id: " + id, 404);
    }

    public static TicketException forbidden(String action) {
        return new TicketException("You are not allowed to: " + action, 403);
    }

    public static TicketException badRequest(String message) {
        return new TicketException(message, 400);
    }

    public static TicketException conflict(String message) {
        return new TicketException(message, 409);
    }
}