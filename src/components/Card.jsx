export default function Card({ title, img }) {
  return (
    <div className="card">
      <img src={img} alt={title} />
      <div className="card-label">
        {title} <span className="chev">›</span>
      </div>
    </div>
  );
}

