import apiClient from "@/lib/api-client";

/**
 * Quick test utility to verify backend connectivity
 * Import and call testBackendConnection() in your component to test
 */

export const testBackendConnection = async () => {
  try {
    console.log("🧪 Testing backend connection...");

    // Test authentication (will fail without valid token, which is expected)
    try {
      const response = await apiClient.verifyAuth();
      console.log("✅ Auth endpoint accessible:", response.status);
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log(
          "⚠️ Auth endpoint accessible but requires token (expected)"
        );
      } else {
        throw err;
      }
    }

    console.log("✅ Backend connection successful!");
    console.log("Base URL:", "http://localhost:3000/api");

    return { success: true, message: "Backend is reachable" };
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
    return {
      success: false,
      message: "Unable to reach backend. Ensure server is running on port 3000",
    };
  }
};

export const testLocationServices = async () => {
  try {
    console.log("🧪 Testing location services...");

    if (!navigator.geolocation) {
      throw new Error("Geolocation not supported");
    }

    // Request current position
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("✅ Location services working");
          console.log(
            `📍 Current location: ${latitude}, ${longitude} (±${Math.round(
              accuracy
            )}m)`
          );
          resolve({
            success: true,
            location: { latitude, longitude, accuracy },
          });
        },
        (error) => {
          console.error("❌ Location services failed:", error.message);
          reject({
            success: false,
            message: error.message,
          });
        }
      );
    });
  } catch (error) {
    console.error("❌ Location test failed:", error);
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};

export const testFullIntegration = async () => {
  console.log("🧪 Running full integration test...");

  try {
    // Test backend
    const backendTest = await testBackendConnection();
    if (!backendTest.success) {
      return backendTest;
    }

    // Test location
    const locationTest: any = await testLocationServices();
    if (!locationTest.success) {
      return locationTest;
    }

    console.log("✅ All tests passed!");
    return {
      success: true,
      message: "Frontend and backend integration is working correctly",
    };
  } catch (error) {
    console.error("❌ Integration test failed:", error);
    return {
      success: false,
      message: "Integration test failed",
    };
  }
};
