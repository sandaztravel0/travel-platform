-- ============================================
-- SRI LANKA TRAVEL PLATFORM - DATABASE SCHEMA
-- ============================================

-- USERS (Tourists / Travelers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BUSINESS ACCOUNTS (Vehicle owners, Drivers, Stay owners)
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(150) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL, -- 'vehicle', 'driver', 'stay'
    nic_number VARCHAR(20),             -- for KYC
    business_registration_doc TEXT,     -- uploaded doc URL
    status VARCHAR(20) DEFAULT 'pending', -- pending / approved / rejected / suspended
    bank_account_name VARCHAR(150),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- super_admin / admin
    created_at TIMESTAMP DEFAULT NOW()
);

-- LOCATIONS (Admin managed - e.g. Sigiriya, Ella, Galle Fort)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    category VARCHAR(50), -- beach / historical / hill-country / wildlife / city
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LOCATION IMAGES
CREATE TABLE location_images (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- LISTINGS (Vehicles, Drivers-for-hire, Stays) - added by Businesses
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
    listing_type VARCHAR(50) NOT NULL, -- 'vehicle', 'driver', 'stay'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2),
    location_id INT REFERENCES locations(id),
    capacity INT,                 -- seats (vehicle) or guests (stay)
    vehicle_type VARCHAR(50),     -- car / van / tuk-tuk / bike (if vehicle)
    amenities TEXT,               -- json/text: AC, WiFi, pool, etc (if stay)
    status VARCHAR(20) DEFAULT 'pending', -- pending / approved / rejected / inactive
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW()
);

-- LISTING IMAGES
CREATE TABLE listing_images (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- BOOKINGS
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    listing_id INT REFERENCES listings(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL, -- platform's cut
    payout_amount DECIMAL(10, 2) NOT NULL,     -- business gets this
    status VARCHAR(20) DEFAULT 'pending',       -- pending / confirmed / completed / cancelled
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid / paid / refunded
    payhere_order_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- PAYMENTS LOG
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    payhere_payment_id VARCHAR(100),
    status VARCHAR(20), -- success / failed / pending
    paid_at TIMESTAMP DEFAULT NOW()
);

-- PAYOUTS to businesses (after admin releases commission-deducted amount)
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id),
    booking_id INT REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending / paid
    paid_at TIMESTAMP
);

-- TRIP PLANNER (user creates a trip with multiple locations + bookings)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    trip_name VARCHAR(150),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INT REFERENCES trips(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id),
    stop_order INT,
    planned_date DATE
);

-- LIVE LOCATION TRACKING (for drivers/vehicles during active bookings)
CREATE TABLE live_locations (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    user_id INT REFERENCES users(id),
    listing_id INT REFERENCES listings(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
