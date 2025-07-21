# CTC Backend

This is the backend for **Cefalo Travel Connect (CTC)**, a comprehensive travel-sharing and planning web application. It is built using Express.js, TypeScript, PostgreSQL, and PostGIS, and follows modular service-oriented architecture. The API supports user authentication, travel plan coordination, blogging, commenting, wishlists, and location-based services.

---

## Features

- User signup, login, and JWT-based authentication
- Blog system with transport, lodge, food, and insight associations
- Wishlist creation and matchmaking between users
- Travel planning with members, transports, lodges, and discussions
- Geospatial search using PostGIS for locations and transports
- Role-based access control for users and admins
- Commenting and reactions on blogs
- Email verification and password reset via email
- RESTful API with clear routing and structure

---

## Technologies Used

- **Node.js / Express.js** – Web framework
- **TypeScript** – Static typing for better maintainability
- **PostgreSQL + PostGIS** – Relational DB with spatial support
- **Knex.js** – SQL query builder and migration management
- **JWT** – Authentication tokens
- **Zod** – Request validation
- **Bcrypt** – Password hashing
- **Nodemailer + Resend** – Email delivery for verification and reset
- **Jest** – Unit testing
- **dotenv** – Environment variable management

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ctc-backend.git
   cd ctc-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a `.env` file and define variables:
     ```
     PORT=5000
     DATABASE_URL=postgres://user:password@localhost:5432/ctc
     JWT_SECRET=your_jwt_secret
     ```

4. **Run migrations**
   ```bash
   npm run migrate:latest
   ```

5. **Start the server**
   ```bash
   npm start
   ```

---

## API Documentation

You can access the full API documentation here:  
**[Postman Public API Docs](https://documenter.getpostman.com/view/42803033/2sB2x8GX81)**

For a detailed route/middleware/handler map, see: [`documents/routes.md`](documents/routes.md)

---

## Error Handling

CTC Backend provides a structured error-handling system using custom exceptions based on `HttpException`.

### Exception Format

All error responses follow this format:

```json
{
  "message": "Descriptive error message",
  "errorCode": 1001,
  "errors": null
}
```

- `message`: Human-readable explanation of the error.
- `errorCode`: Application-specific numeric identifier.
- `errors`: (optional) Additional error details, often used for validation.

### Common Error Types

| Error Type               | HTTP Code | Example Message                  | Error Code |
|--------------------------|-----------|----------------------------------|------------|
| `BadRequestException`    | 400       | Invalid blog ID                  | 5001       |
| `UnauthorizedException`  | 401       | Token is invalid or expired      | 14002      |
| `ForbiddenException`     | 403       | Access denied                    | 4002       |
| `NotFoundException`      | 404       | User not found                   | 1001       |
| `UnprocessableException` | 422       | Input validation failed          | 2001       |
| `InternalException`      | 500       | Something went wrong             | 3001       |

### Error Code Reference

| Code      | Description                          |
|-----------|--------------------------------------|
| 1001      | USER_NOTFOUND                         |
| 1002      | USER_ALREADY_EXISTS                   |
| 1003      | PHONE_NUMBER_EXISTS                   |
| 1004      | INCORRECT_PASSWORD                    |
| 1005      | INVALID_USER_ID                       |
| 14001     | REFRESH_TOKEN_NOT_FOUND               |
| 14002     | TOKEN_EXPIRED                         |
| 15001     | ALREADY_VERIFIED                      |
| 15002     | INVALID_VERIFICATION_TOKEN            |
| 5001      | INVALID_BLOG_ID                       |
| 5002      | BLOG_NOT_FOUND                        |
| 6001      | INVALID_TRANSPORT_ID                  |
| 6002      | TRANSPORT_NOT_FOUND                   |
| 7001      | INVALID_LODGE_ID                      |
| 7002      | LODGE_NOT_FOUND                       |
| 8001      | INVALID_TRAVEL_PLACE_ID               |
| 8002      | TRAVEL_PLACE_NOT_FOUND                |
| 9001      | INVALID_FOOD_ID                       |
| 9002      | FOOD_NOT_FOUND                        |
| 10001     | INVALID_BLOG_INSIGHT_ID               |
| 10002     | BLOG_INSIGHT_NOT_FOUND                |
| 11001     | INVALID_TRAVEL_PLAN_ID                |
| 11002     | TRAVEL_PLAN_NOT_FOUND                 |
| 12001     | INVALID_WISHLIST_ID                   |
| 12002     | WISHLIST_NOT_FOUND                    |
| 13001     | INVALID_TRAVEL_REQUEST_ID             |
| 13002     | TRAVEL_REQUEST_NOT_FOUND              |
| 16001     | DISCUSSION_NOT_FOUND                  |
| 16002     | INVALID_DISCUSSION_ID                 |
| 17001     | INVALID_TOUR_TRANSPORT_ID             |
| 17002     | TOUR_TRANSPORT_NOT_FOUND              |
| 18001     | REACTION_NOT_FOUND                    |

---

## Development Scripts

- `npm start` – Start server with Nodemon
- `npm run mk:migrate` – Create a new Knex migration
- `npm run migrate:latest` – Apply latest DB migrations

---

## Testing

Unit tests are written using **Jest**. You can run tests with:

```bash
npm test
```

Coverage includes services, repositories, and utilities.

---

## Contribution

Pull requests are welcome. Please follow the existing code style and commit convention. Write unit tests where applicable.

---

## License

This project is licensed under the **ISC License**.

---

## Author

Developed and maintained by Md Sabbir Hosen.