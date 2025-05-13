import math

def local_to_global(local_x, local_y, local_z, lat0, lon0, alt0):
    # WGS84 ellipsoid constants
    a = 6378137.0  # Equatorial radius in meters
    f = 1 / 298.257223563  # Flattening
    b = a * (1 - f)  # Polar radius
    e_sq = f * (2 - f)  # Square of eccentricity

    # Convert reference latitude and longitude to radians
    phi0 = math.radians(lat0)
    lam0 = math.radians(lon0)

    # Compute prime vertical radius of curvature
    sin_phi0 = math.sin(phi0)
    cos_phi0 = math.cos(phi0)
    N0 = a / math.sqrt(1 - e_sq * sin_phi0 ** 2)

    # Convert reference point to ECEF coordinates
    X0 = (N0 + alt0) * cos_phi0 * math.cos(lam0)
    Y0 = (N0 + alt0) * cos_phi0 * math.sin(lam0)
    Z0 = (N0 * (1 - e_sq) + alt0) * sin_phi0

    # Adjust local coordinates to ENU
    x_enu = local_x
    y_enu = local_y
    z_enu = -local_z  # Negate Z to align with North

    # Compute rotation matrix elements
    sin_lam0 = math.sin(lam0)
    cos_lam0 = math.cos(lam0)
    sin_phi0 = math.sin(phi0)
    cos_phi0 = math.cos(phi0)

    # Rotation matrix from ENU to ECEF
    R = [
        [-sin_lam0, -sin_phi0 * cos_lam0, cos_phi0 * cos_lam0],
        [cos_lam0, -sin_phi0 * sin_lam0, cos_phi0 * sin_lam0],
        [0, cos_phi0, sin_phi0]
    ]

    # Transform local ENU coordinates to ECEF
    X = R[0][0] * x_enu + R[0][1] * y_enu + R[0][2] * z_enu + X0
    Y = R[1][0] * x_enu + R[1][1] * y_enu + R[1][2] * z_enu + Y0
    Z = R[2][0] * x_enu + R[2][1] * y_enu + R[2][2] * z_enu + Z0

    # Convert ECEF to geodetic coordinates
    # Iterative method
    p = math.sqrt(X ** 2 + Y ** 2)
    lambda_geo = math.atan2(Y, X)

    # Initial guess of phi
    phi = math.atan2(Z, p * (1 - e_sq))
    phi_prev = 0
    epsilon = 1e-12  # Convergence criterion

    while abs(phi - phi_prev) > epsilon:
        phi_prev = phi
        sin_phi = math.sin(phi)
        N = a / math.sqrt(1 - e_sq * sin_phi ** 2)
        h = p / math.cos(phi) - N
        phi = math.atan2(Z, p * (1 - e_sq * (N / (N + h))))

    # Compute altitude
    N = a / math.sqrt(1 - e_sq * math.sin(phi) ** 2)
    h = p / math.cos(phi) - N

    # Convert back to degrees
    latitude = math.degrees(phi)
    longitude = math.degrees(lambda_geo)
    altitude = h  # In meters

    return latitude + 45.4706, longitude -73.9367, altitude 
