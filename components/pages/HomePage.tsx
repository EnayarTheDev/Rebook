'use client';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div className="space-y-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-t-4 border-green-500">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 bg-clip-text text-transparent text-center mb-4">
          Échangez vos livres
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          La plateforme simple pour échanger vos livres gratuitement avec d'autres lecteurs.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setCurrentPage('browse')}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Parcourir les livres
          </button>
          <button
            onClick={() => setCurrentPage('offer')}
            className="px-8 py-3 bg-white text-green-500 border-2 border-green-500 font-semibold rounded-full hover:bg-green-500 hover:text-white hover:scale-105 transition-all"
          >
            Proposer un livre
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Pourquoi Re:Book ?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl hover:-translate-y-2 transition-all">
            
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Gratuit</h3>
            <p className="text-gray-600 text-center">Aucun argent impliqué. Échangez vos livres gratuitement et trouvez exactement ce que vous cherchez.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl hover:-translate-y-2 transition-all">
            
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Écologique</h3>
            <p className="text-gray-600 text-center">Donnez une seconde vie à vos livres et réduisez le gaspillage. Faites partie de la solution.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl hover:-translate-y-2 transition-all">
            
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Simple</h3>
            <p className="text-gray-600 text-center">Interface facile à utiliser. Proposez vos livres et trouvez des partenaires d'échange en quelques minutes.</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-12 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Prêt à commencer l'échange ?</h3>
        <p className="mb-6 text-lg">Rejoignez Re:Book aujourd'hui et connectez-vous avec d'autres lecteurs</p>
        <button
          onClick={() => setCurrentPage('browse')}
          className="px-8 py-3 bg-white text-green-600 font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all"
        >
          Explorer les livres
        </button>
      </div>
    </div>
  );
}
