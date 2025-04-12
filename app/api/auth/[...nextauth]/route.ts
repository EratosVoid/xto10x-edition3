import NextAuth from "next-auth";
import { NextRequest, NextResponse } from 'next/server';

import authOptions from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Add a custom handler for the signout route
export async function DELETE(req: NextRequest) {
  // You might want to add some server-side logic here, e.g., logging
  const responseHtml = `
    <html>
      <head>
        <script>
          window.location.reload();
        </script>
      </head>
      <body>
        <p>Signing out...</p>
      </body>
    </html>
  `;

  return new NextResponse(responseHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
