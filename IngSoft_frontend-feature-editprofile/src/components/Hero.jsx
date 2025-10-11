import Card from "./Card";

export default function Hero() {
  return (
    <main className="container">
      <div className="hero">
        <h1>Nuestra agenda de eventos para esta semana</h1>
        
        <div className="card-grid">
          <Card title="Tecnología" img="https://via.placeholder.com/240x160?text=Tecnologia" />
          <Card title="Juegos" img="https://via.placeholder.com/240x160?text=Juegos" />
          <Card title="Música" img="https://via.placeholder.com/240x160?text=Musica" />
        </div>
      </div>
    </main>
  );
}

