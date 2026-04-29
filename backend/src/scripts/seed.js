import pg from "pg";
import "dotenv/config";

const { Client } = pg;

const seed = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const r1 = await client.query(
      `INSERT INTO restaurants (name, image_url, latitude, longitude, eta_min)
       VALUES ('Sushi Wave', 'https://picsum.photos/300/200', 48.8566, 2.3522, 25)
       RETURNING id`
    );

    const r2 = await client.query(
      `INSERT INTO restaurants (name, image_url, latitude, longitude, eta_min)
       VALUES ('Burger Spot', 'https://picsum.photos/300/201', 48.8584, 2.2945, 18)
       RETURNING id`
    );

    await client.query(
      `INSERT INTO menu_items (restaurant_id, name, description, image_url, price_cents) VALUES
       ($1, 'Salmon Maki', '8 pieces', 'https://picsum.photos/200/200', 1090),
       ($1, 'California Roll', 'Crab and avocado', 'https://picsum.photos/200/201', 990),
       ($2, 'Cheese Burger', 'Beef, cheddar, pickles', 'https://picsum.photos/200/202', 1290),
       ($2, 'Fries', 'Crispy fries', 'https://picsum.photos/200/203', 450)`,
      [r1.rows[0].id, r2.rows[0].id]
    );

    console.log("Seed terminee.");
  } finally {
    await client.end();
  }
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
