import { BuilderComponent, builder } from "@builder.io/react";
import { env } from "@/lib/env";

builder.init(env.BUILDER_PUBLIC_KEY);

export const revalidate = 30; // ISR for content updates

export default async function VipPage() {
  // Fetch content for the VIP page by URL
  const content = await builder.get("page", { url: "/vip" }).toPromise();

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24 }}>VIP Room</h1>
        <form action="/api/vip/logout" method="post">
          <button className="btn" type="submit">Logout</button>
        </form>
      </div>
      <div className="card">
        {content ? (
          <BuilderComponent model="page" content={content} />
        ) : (
          <div>
            <h2 style={{ marginTop: 0 }}>Connect Builder.io</h2>
            <p className="muted">No content found for <code>/vip</code>. Publish a page in Builder with that URL or swap the model key.</p>
          </div>
        )}
      </div>
    </div>
  );
}
