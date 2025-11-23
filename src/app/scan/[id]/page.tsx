"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ScanDetailsPage() {
  const { id } = useParams(); // UUID du QR code
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("qr_commandes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur:", error);
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fc",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "480px",
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "20px",
            fontWeight: "bold",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          Détails de la Commande
        </h1>

        {loading && <p>Chargement...</p>}

        {!loading && !order && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            Commande introuvable 
          </p>
        )}

        {order && (
          <>
            <div
              style={{
                background: "#fff7f3",
                padding: "15px",
                borderRadius: "10px",
                border: "1px solid #ff6b35",
                marginBottom: "20px",
              }}
            >
              <p>
                <strong>ID Commande :</strong> {order.id_commande}
              </p>
              <p>
                <strong>Date :</strong> {order.date_commande}
              </p>
              <p>
                <strong>Mode de paiement :</strong> {order.mode_paiement}
              </p>
              <p>
                <strong>Statut :</strong>{" "}
                <span style={{ color: "#ff6b35", fontWeight: "bold" }}>
                  {order.statut}
                </span>
              </p>
              <p>
                <strong>Restaurant :</strong> {order.nom_restaurant}
              </p>
              <p>
                <strong>Total :</strong>{" "}
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  {order.prix_total} Fcfa
                </span>
              </p>
            </div>

            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: "bold",
                marginTop: "20px",
                marginBottom: "10px",
              }}
            >
              Articles :
            </h3>

            <div>
              {order.lignes?.map((item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: "10px 15px",
                    background: "#f1f5f9",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{item.plat.nom}</span>
                  <strong>x{item.quantite}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}