# """
# Startup script for Lead Intelligence Platform API
# Handles PORT environment variable from Railway
# """
# import os
# import uvicorn

# if __name__ == "__main__":
#     # Get port from environment (Railway sets this)
#     port = int(os.getenv("PORT", 8000))
    
#     print("=" * 60)
#     print(f"🚀 Starting Lead Intelligence Platform API")
#     print(f"📡 Port: {port}")
#     print(f"🌐 Host: 0.0.0.0")
#     print("=" * 60)
    
#     # Start uvicorn
#     uvicorn.run(
#         "main:app",
#         host="0.0.0.0",
#         port=port,
#         log_level="info"
#     )