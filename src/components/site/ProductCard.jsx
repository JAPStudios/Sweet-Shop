import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Check, Star } from "lucide-react";
import { Image } from "@/components/ui/image";
import { addToCart, removeFromCart, readCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

const CSS = `
.pgc-card{--pgc-card:rgba(255,255,255,.9);--pgc-text:hsl(330 22% 17%);--pgc-muted:hsl(330 12% 40%);
--pgc-badge:rgba(255,255,255,.92);--pgc-badge-text:hsl(330 16% 34%);--pgc-star:hsl(276 30% 45%);
--pgc-add-bg:hsl(332 34% 40%);--pgc-add-text:hsl(38 100% 97%);--pgc-dot:hsl(332 40% 42%);--pgc-dot-muted:rgba(60,40,50,.22);
position:relative;width:100%;max-width:443px;box-sizing:border-box;overflow:hidden;border-radius:44px;padding:11px;
background:var(--pgc-card);color:var(--pgc-text);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
box-shadow:0 18px 50px -20px rgba(60,40,50,.35);transform:scale(.995);
transition:transform .25s cubic-bezier(.22,1,.36,1),opacity .9s ease,translate .9s cubic-bezier(.16,1,.3,1),scale .9s cubic-bezier(.16,1,.3,1);
opacity:0;translate:0 44px;scale:.94;}
.pgc-card.pgc-in{opacity:1;translate:0 0;scale:1}
.pgc-card:hover,.pgc-card:focus-within,.pgc-card.pgc-open{transform:scale(1)}
@media (prefers-reduced-motion:reduce){.pgc-card{opacity:1;translate:0 0;scale:1}.pgc-track{transition:none!important}}
.pgc-card:focus-visible{box-shadow:0 18px 50px -20px rgba(60,40,50,.35),0 0 0 2px rgba(80,50,65,.35)}
.pgc-photo{position:relative;width:100%;overflow:hidden;border-radius:36px;aspect-ratio:421/362;background:hsl(34 46% 94%)}
.pgc-track{display:flex;width:100%;height:100%;transition:transform .85s cubic-bezier(.25,1,.5,1)}
.pgc-slide{flex:0 0 100%;width:100%;height:100%}
.pgc-badges{position:absolute;top:16px;left:20px;right:20px;display:flex;justify-content:flex-end;gap:8px;pointer-events:none}
.pgc-badges-right{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:9px}
.pgc-pill{display:flex;align-items:center;justify-content:center;border-radius:9999px;padding:4px 14px;font-size:15px;line-height:1.1;white-space:nowrap;background:var(--pgc-badge);color:var(--pgc-badge-text);font-weight:600;letter-spacing:.01em}
.pgc-rating{gap:6px;padding-left:10px;padding-right:10px}
.pgc-star{width:15px;height:15px;color:var(--pgc-star)}
.pgc-dots{position:absolute;left:0;right:0;bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .32s cubic-bezier(.22,1,.36,1),transform .32s cubic-bezier(.22,1,.36,1)}
.pgc-card:hover .pgc-dots,.pgc-card:focus-within .pgc-dots,.pgc-card.pgc-open .pgc-dots{opacity:1;transform:translateY(0);pointer-events:auto}
.pgc-dot{width:9px;height:9px;border-radius:9999px;border:none;padding:0;background:var(--pgc-dot-muted);cursor:pointer}
.pgc-dot.pgc-dot-active{background:var(--pgc-dot)}
.pgc-content{padding:18px 20px 9px}
.pgc-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.pgc-name{margin:0;font-size:29px;line-height:1.05;color:var(--pgc-text);font-weight:400}
.pgc-seller{margin:6px 0 0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--pgc-muted);font-weight:600}
.pgc-price-closed{display:flex;flex-shrink:0;align-items:baseline;gap:8px;opacity:1;transition:opacity .32s cubic-bezier(.22,1,.36,1)}
.pgc-card:hover .pgc-price-closed,.pgc-card:focus-within .pgc-price-closed,.pgc-card.pgc-open .pgc-price-closed{opacity:0;pointer-events:none}
.pgc-price-was{font-size:16px;line-height:1;color:var(--pgc-muted);text-decoration:line-through}
.pgc-price-now{font-size:16px;line-height:1;color:var(--pgc-text);font-weight:600}
.pgc-extras{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .32s cubic-bezier(.22,1,.36,1),opacity .32s cubic-bezier(.22,1,.36,1)}
.pgc-card:hover .pgc-extras,.pgc-card:focus-within .pgc-extras,.pgc-card.pgc-open .pgc-extras{grid-template-rows:1fr;opacity:1}
.pgc-extras-inner{overflow:hidden;min-height:0}
.pgc-description{margin:0;padding-top:16px;font-size:16px;line-height:22px;color:var(--pgc-muted)}
.pgc-price-open{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:24px}
.pgc-price-open-group{display:flex;align-items:baseline;gap:10px}
.pgc-price-open .pgc-price-was,.pgc-price-open .pgc-price-now{font-size:19px}
.pgc-add{display:inline-flex;flex-shrink:0;align-items:center;justify-content:center;border:none;border-radius:9999px;padding:9px 20px;font-size:17px;line-height:1;background:var(--pgc-add-bg);color:var(--pgc-add-text);font-family:inherit;font-weight:600;cursor:pointer;transition:box-shadow .2s,transform .12s}
.pgc-add:active{transform:scale(.94)}
.pgc-add:focus-visible{box-shadow:0 0 0 2px rgba(80,50,65,.4)}
.pgc-add-icon{display:flex;align-items:center;justify-content:center;overflow:hidden;width:0;margin-right:0;opacity:0;transition:width .18s ease-out,margin-right .18s ease-out,opacity .18s ease-out}
.pgc-add:hover .pgc-add-icon,.pgc-add:focus-visible .pgc-add-icon,.pgc-add.pgc-added .pgc-add-icon,.pgc-add.pgc-loading .pgc-add-icon{width:20px;margin-right:6px;opacity:1}
.pgc-add-spinner{display:none;width:16px;height:16px;box-sizing:border-box;border-radius:9999px;border:2px solid rgba(255,255,255,.35);border-top-color:var(--pgc-add-text);animation:pgc-spin .6s linear infinite}
@keyframes pgc-spin{to{transform:rotate(360deg)}}
.pgc-add.pgc-loading .pgc-add-plus,.pgc-add.pgc-loading .pgc-add-check{display:none}
.pgc-add.pgc-loading .pgc-add-spinner{display:block}
.pgc-add.pgc-added .pgc-add-plus{display:none}
.pgc-add.pgc-added .pgc-add-check{display:block;animation:pgc-pop .28s cubic-bezier(.22,1,.36,1)}
@keyframes pgc-pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@media (max-width:480px){
.pgc-row{flex-wrap:wrap}
.pgc-name{font-size:24px}
.pgc-badges{gap:6px}.pgc-badges-right{flex-wrap:nowrap;gap:6px}
.pgc-pill{font-size:13px;padding:3px 10px}.pgc-rating{padding-left:8px;padding-right:8px}.pgc-star{width:13px;height:13px}
.pgc-description{font-size:14px;line-height:20px;padding-top:16px}
.pgc-price-was,.pgc-price-now{font-size:14px}
.pgc-price-open .pgc-price-was,.pgc-price-open .pgc-price-now{font-size:16px}
.pgc-price-open{padding-top:16px;gap:8px}
.pgc-add{font-size:15px;padding:7px 16px}
}
`;

export default function ProductCard({ product }) {
  const images = (product.images?.length ? product.images : [product.image_url]).filter(Boolean);
  const [position, setPosition] = useState(0);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("idle");
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const el = document.getElementById(`pgc-${product.id}`);
    if (!el) return;
    const reveal = () => el.classList.add("pgc-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal();
        });
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    const timer = setTimeout(reveal, 400);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [product.id]);

  useEffect(() => {
    const sync = () => setInCart(readCart().some((i) => i.product_id === product.id));
    sync();
    window.addEventListener("sweet-shop-cart-change", sync);
    return () => window.removeEventListener("sweet-shop-cart-change", sync);
  }, [product.id]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!open || reduced || images.length < 2) return;
    const timer = setInterval(() => setPosition((p) => (p + 1) % images.length), 2600);
    return () => clearInterval(timer);
  }, [open, reduced, images.length]);

  const handleAdd = (event) => {
    event.stopPropagation();
    if (state === "loading") return;
    if (inCart) {
      removeFromCart(product.id);
      return;
    }
    setState("loading");
    setTimeout(() => {
      addToCart(product, 1);
      setState("idle");
    }, 600);
  };

  const price = formatMoney(product.price_cents);
  const compare = product.compare_at_price_cents ? formatMoney(product.compare_at_price_cents) : null;

  return (
    <div className="w-full">
      <style>{CSS}</style>
      <div
        id={`pgc-${product.id}`}
        className={`pgc-card ${open ? "pgc-open" : ""}`}
        role="group"
        tabIndex={0}
        aria-label={`${product.title} — ${price}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="pgc-photo">
          <div className="pgc-track" style={{ transform: `translateX(-${position * 100}%)` }}>
            {images.length === 0 && (
              <div className="pgc-slide flex items-center justify-center bg-gradient-to-br from-[hsl(276_62%_92%)] to-[hsl(154_52%_90%)]">
                <span className="font-heading text-5xl text-primary/30">{product.title?.[0]}</span>
              </div>
            )}
            {images.map((src, index) => (
              <div className="pgc-slide" key={src + index}>
                <Image
                  src={src}
                  alt={product.title}
                  className="h-full w-full"
                  fittingType="fill"
                />
              </div>
            ))}
          </div>

          <div className="pgc-badges">
            <div className="pgc-badges-right">
              {product.badge && <span className="pgc-pill">{product.badge}</span>}
              <span className="pgc-pill pgc-rating">
                <Star className="pgc-star" fill="currentColor" strokeWidth={0} />
                {product.rating ? product.rating.toFixed(1) : "New"}
              </span>
            </div>
          </div>

          {images.length > 1 && (
            <div className="pgc-dots">
              {images.map((src, index) => (
                <button
                  type="button"
                  key={`dot-${index}`}
                  className={`pgc-dot ${index === position ? "pgc-dot-active" : ""}`}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === position}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPosition(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pgc-content">
          <div className="pgc-row">
            <div>
              <h3 className="pgc-name">
                <Link
                  to="/product/$productId"
                  params={{ productId: product.id }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {product.title}
                </Link>
              </h3>
              <p className="pgc-seller">{product.seller_name}</p>
            </div>
            <div className="pgc-price-closed">
              {compare && <span className="pgc-price-was">{compare}</span>}
              <span className="pgc-price-now">{price}</span>
            </div>
          </div>

          <div className="pgc-extras">
            <div className="pgc-extras-inner">
              <p className="pgc-description">{product.description}</p>
              <div className="pgc-price-open">
                <div className="pgc-price-open-group">
                  {compare && <span className="pgc-price-was">{compare}</span>}
                  <span className="pgc-price-now">{price}</span>
                </div>
                <button
                  type="button"
                  className={`pgc-add ${state === "loading" ? "pgc-loading" : ""} ${inCart ? "pgc-added" : ""}`}
                  aria-label={inCart ? "Remove from basket" : "Add to basket"}
                  aria-busy={state === "loading"}
                  onClick={handleAdd}
                >
                  <span className="pgc-add-icon" aria-hidden="true">
                    <Plus className="pgc-add-plus" size={20} strokeWidth={2.5} />
                    <Check className="pgc-add-check" size={20} strokeWidth={2.5} />
                    <span className="pgc-add-spinner" />
                  </span>
                  <span className="pgc-add-label">{inCart ? "Added" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}