
# Event Management API

A simple RESTful API to manage Users, Events, and Registrations.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/prince-vishwakarma-cs/event-management-api.git
   cd event-management-api

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URI=your_postgres_connection_uri
   PORT=4000
   ```

4. **Run the Server**

   ```bash
   npm start
   ```

## API Endpoints

### Base URL

```
http://localhost:4000/
```

### Root

**GET /**
**Response:**

```json
{
  "message": "Event Management API"
}
```

### Users

#### Create User

**POST /api/users**
**Request:**

```json
{
  "name": "Prince Vishwakarma",
  "email": "emailaddres.prince@gmail.com"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 4,
    "name": "Prince Vishwakarma",
    "email": "emailaddres.prince@gmail.com",
    "created_at": "2025-07-15T04:58:48.984Z"
  }
}
```

#### Get All Users

**GET /api/users**
**Response:**

```json
{
  "success": true,
  "users": [
    {
      "id": 4,
      "name": "Prince Vishwakarma",
      "email": "emailaddres.prince@gmail.com",
      "created_at": "2025-07-15T04:58:48.984Z"
    }
  ]
}
```

### Events

#### Create Event

**POST /api/events**
**Request:**

```json
{
  "title": "Fantastic four Theatre",
  "date_time": "2025-07-25T10:00:00Z",
  "location": "Bhopal",
  "capacity": 45
}
```

**Response:**

```json
{
  "success": true,
  "event_id": 7
}
```

#### Get All Events

**GET /api/events**
**Response:**

```json
{
  "success": true,
  "events": [
    {
      "id": 7,
      "title": "Fantastic four Theatre",
      "date_time": "2025-07-25T04:30:00.000Z",
      "location": "Bhopal",
      "capacity": 45,
      "created_at": "2025-07-15T05:27:09.246Z"
    }
  ],
  "count": 1
}
```

#### Get Event by ID

**GET /api/events/\:id**
**Response:**

```json
{
  "success": true,
  "event": {
    "id": 7,
    "title": "Fantastic four Theatre",
    "date_time": "2025-07-25T04:30:00.000Z",
    "location": "Bhopal",
    "capacity": 45,
    "created_at": "2025-07-15T05:27:09.246Z",
    "registered_users": [],
    "current_registrations": 0
  }
}
```

### Registration

#### Register for Event

**POST /api/events/\:id/register**
**Request:**

```json
{
  "user_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "registration": {
    "id": 4,
    "user_id": 1,
    "event_id": 7,
    "registered_at": "2025-07-15T05:30:10.378Z"
  }
}
```

#### Cancel Registration

**DELETE /api/events/\:id/register**
**Response:**

```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

### Statistics

#### Get Event Stats

**GET /api/events/\:id/stats**
**Response:**

```json
{
  "success": true,
  "stats": {
    "event_id": 7,
    "event_title": "Fantastic four Theatre",
    "total_registrations": 0,
    "remaining_capacity": 45,
    "capacity_used_percentage": 0,
    "max_capacity": 45
  }
}
```
```
