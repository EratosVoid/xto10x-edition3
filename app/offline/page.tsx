"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

export default function OfflinePage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md w-full p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-gray-100 rounded-full">
            <svg
              className="h-12 w-12 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.072M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            You&apos;re Offline
          </h1>
          <p className="text-center text-gray-600">
            It seems you&apos;ve lost your internet connection. Please check
            your network and try again.
          </p>
          <Button
            className="w-full"
            color="primary"
            onPress={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </Card>
    </div>
  );
}
