import Link from 'next/link'

export default function FestivalTable() {
  // TODO: Integrar con API real
  const festivals = []
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Festivales, Muestras y Proyectos</h2>
        <Link href="/festivals-management/edit/new" className="btn btn-primary">
          Crear nuevo
        </Link>
      </div>
      {/* Aquí irá la tabla de festivales */}
      <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
        No hay registros aún.
      </div>
    </div>
  )
}
