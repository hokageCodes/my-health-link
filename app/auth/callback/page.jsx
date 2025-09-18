import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Completing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("OAuth callback page - processing parameters");
        
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const userParam = searchParams.get("user");
        const redirectUrl = searchParams.get("redirect");
        const error = searchParams.get("error");
        const errorMessage = searchParams.get("message");

        // Handle errors
        if (error) {
          console.error("OAuth callback error:", error, errorMessage);
          setStatus("error");
          setMessage(errorMessage || "Authentication failed");
          
          setTimeout(() => {
            router.push(`/login?error=${error}${errorMessage ? `&message=${encodeURIComponent(errorMessage)}` : ''}`);
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!accessToken || !userParam) {
          console.error("Missing required OAuth callback parameters:", {
            hasAccessToken: !!accessToken,
            hasUserParam: !!userParam
          });
          setStatus("error");
          setMessage("Missing authentication data");
          
          setTimeout(() => {
            router.push("/login?error=oauth_missing_data");
          }, 3000);
          return;
        }

        // Parse and validate user data
        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
          console.log("Parsed OAuth user data:", userData);
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          setStatus("error");
          setMessage("Invalid user data received");
          
          setTimeout(() => {
            router.push("/login?error=oauth_invalid_data");
          }, 3000);
          return;
        }

        // Store authentication tokens
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Update auth context
        setUser(userData);
        
        // Update status for user feedback
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        console.log("OAuth authentication completed successfully");

        // Handle redirection based on user state
        setTimeout(() => {
          if (!userData.isVerified) {
            console.log("User not verified, redirecting to verification");
            router.push(`/verify?email=${encodeURIComponent(userData.email)}`);
            return;
          }

          // Use custom redirect URL if provided
          if (redirectUrl && redirectUrl !== "/user/dashboard" && redirectUrl !== "/dashboard") {
            console.log("Using custom redirect URL:", redirectUrl);
            router.push(redirectUrl);
            return;
          }

          // Default role-based redirect
          let dashboardUrl;
          switch (userData.role) {
            case "admin":
              dashboardUrl = "/admin/dashboard";
              break;
            case "caregiver":
              dashboardUrl = "/caregiver/dashboard";
              break;
            case "patient":
            case "user":
            default:
              dashboardUrl = "/user/dashboard";
              break;
          }

          console.log("Redirecting to role-based dashboard:", dashboardUrl);
          router.push(dashboardUrl);

        }, 2000); // 2 second delay to show success message

      } catch (error) {
        console.error("OAuth callback processing error:", error);
        setStatus("error");
        setMessage("Failed to process authentication");
        
        setTimeout(() => {
          router.push("/login?error=callback_processing_failed");
        }, 3000);
      }
    };

    // Only run if we have search params
    if (searchParams.toString()) {
      handleCallback();
    }
  }, [searchParams, router, setUser]);

  const StatusIcon = () => {
    switch (status) {
      case "processing":
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        );
      case "success":
        return (
          <div className="text-green-600 text-6xl font-bold">✓</div>
        );
      case "error":
        return (
          <div className="text-red-600 text-6xl font-bold">✗</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <StatusIcon />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "processing" && "Authenticating..."}
          {status === "success" && "Success!"}
          {status === "error" && "Authentication Failed"}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        {status === "error" && (
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}