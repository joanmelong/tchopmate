"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function QRCodePage() {
  const { id } = useParams(); // UUID venant de Supabase
  const [order, setOrder] = useState<{ id: number; commande_id: number; qr_code_data: string } | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("qr_commandes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else setOrder(data);
    };

    fetchOrder();
  }, [id]);

  const qrURL = order
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://tchopmate.com/scan/${order.id}`
    : "";

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mon QR Code — Tchopmate</title>

        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          }

          body {
            background-color: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 20px;
          }

          .logo {
            width: 70px;
            height: 70px;
            background-color: #ff6b35;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
            font-weight: bold;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
          }

          .card {
            background-color: white;
            border-radius: 20px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            width: 460px;
            padding: 25px 30px;
            text-align: center;
            animation: fadeIn 0.6s ease forwards;
            position: relative;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .back-link {
            position: absolute;
            top: 20px;
            left: 25px;
          }

          .back-link a {
            color: #ff6b35;
            font-weight: 600;
            text-decoration: none;
            font-size: 0.95rem;
          }

          h1 {
            font-size: 1.8rem;
            font-weight: bold;
            color: #0f172a;
            margin-top: 10px;
            margin-bottom: 1.5rem;
          }

          .qr-section {
            position: relative;
            background: linear-gradient(135deg, rgba(255,107,53,0.05), rgba(255,107,53,0.1));
            border: 4px solid #ff6b35;
            border-radius: 20px;
            padding: 1.5rem;
            overflow: hidden;
          }

          .qr-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(255,107,53,0.15) 0%, transparent 70%);
            animation: pulse 3s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.02); }
          }

          .qr-box {
            position: relative;
            background-color: white;
            border-radius: 15px;
            padding: 1rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            z-index: 1;
            max-width: 220px;
            margin: auto;
          }

          .qr-box img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 10px;
          }
        `}</style>
      </head>

      <body>
        <div className="logo">T</div>

        <div className="card">
          <div className="back-link">
            <a href="/">&larr; Accueil</a>
          </div>

          <h1>Mon QR Code</h1>

          <div className="qr-section">
            <div className="qr-bg"></div>

            <div className="qr-box">
              {!order ? (
                <p>Chargement...</p>
              ) : (
                <img src={qrURL} alt="QR Code" />
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}