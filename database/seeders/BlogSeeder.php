<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer ou récupérer un utilisateur admin
        $admin = User::where('email', 'admin@example.com')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Créer les catégories
        $categories = [
            [
                'name' => 'Sneaker Culture',
                'slug' => 'sneaker-culture',
                'description' => 'Plongez dans l\'univers de la culture sneakers, son histoire et son impact sur la mode urbaine.',
                'order' => 1,
            ],
            [
                'name' => 'Guides & Astuces',
                'slug' => 'guides-astuces',
                'description' => 'Nos meilleurs conseils pour entretenir, personnaliser et préserver vos sneakers.',
                'order' => 2,
            ],
            [
                'name' => 'Nouveautés & Drops',
                'slug' => 'nouveautes-drops',
                'description' => 'Restez informé des dernières sorties et des drops les plus attendus du moment.',
                'order' => 3,
            ],
            [
                'name' => 'Streetwear',
                'slug' => 'streetwear',
                'description' => 'Mode streetwear, tendances et looks inspirants pour compléter vos sneakers.',
                'order' => 4,
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $categoryData) {
            $createdCategories[] = BlogCategory::create($categoryData);
        }

        // Créer des articles d'exemple
        $posts = [
            [
                'title' => 'Comment nettoyer et entretenir vos sneakers comme un pro',
                'excerpt' => 'Découvrez les techniques et produits essentiels pour garder vos sneakers impeccables, qu\'elles soient en cuir, en daim ou en toile.',
                'content' => '<h2>L\'entretien régulier : la clé de la longévité</h2>
                <p>Vos sneakers sont bien plus qu\'une simple paire de chaussures. Pour les garder en parfait état, un entretien régulier est essentiel. Voici nos meilleurs conseils.</p>
                
                <h3>Les outils indispensables</h3>
                <ul>
                    <li>Brosse à poils doux pour les matériaux délicats</li>
                    <li>Brosse à poils durs pour les semelles</li>
                    <li>Nettoyant spécifique sneakers</li>
                    <li>Chiffons microfibres</li>
                    <li>Protection imperméabilisante</li>
                </ul>

                <h3>Nettoyage selon le matériau</h3>
                <p><strong>Cuir :</strong> Utilisez un nettoyant cuir doux et un chiffon humide. Séchez à l\'air libre.</p>
                <p><strong>Daim :</strong> Brossez délicatement avec une brosse spéciale daim. Évitez l\'eau autant que possible.</p>
                <p><strong>Toile :</strong> Lavage à la main avec eau tiède et savon doux. Jamais en machine !</p>
                
                <h3>Astuces de pro</h3>
                <p>Appliquez toujours une protection imperméabilisante après le nettoyage. Stockez vos sneakers dans leur boîte d\'origine avec du papier de soie pour maintenir leur forme.</p>',
                'category_id' => $createdCategories[1]->id, // Guides & Astuces
                'author_id' => $admin->id,
                'tags' => ['entretien', 'nettoyage', 'guide', 'sneaker care'],
                'published_at' => now()->subDays(5),
                'is_featured' => true,
                'read_time' => 6,
                'views' => 1247,
            ],
            [
                'title' => 'Les 10 drops sneakers les plus attendus de l\'année',
                'excerpt' => 'Notre sélection exclusive des sorties sneakers qui vont marquer 2026. Dates, prix et où les acheter.',
                'content' => '<h2>Les collaborations qui vont faire le buzz</h2>
                <p>2026 s\'annonce comme une année exceptionnelle pour les sneakerheads. Voici notre top 10 des sorties les plus hype.</p>
                
                <h3>1. Nike Dunk Low x Travis Scott "Cactus Jack"</h3>
                <p>Date de sortie : Mars 2026 | Prix : 180€</p>
                <p>Le rappeur continue sa collaboration légendaire avec Nike. Coloris terre de sienne et matériaux premium.</p>
                
                <h3>2. Adidas Yeezy Boost 350 V3</h3>
                <p>Date de sortie : Avril 2026 | Prix : 220€</p>
                <p>La nouvelle itération du modèle iconique de Kanye West avec une upper redessinée.</p>
                
                <h3>3. Air Jordan 1 High "Heritage"</h3>
                <p>Date de sortie : Mai 2026 | Prix : 170€</p>
                <p>Un retour aux sources avec un coloris Chicago revisité en cuir premium tumbled.</p>
                
                <p>Restez connectés pour ne manquer aucun drop ! Suivez nos alertes en temps réel.</p>',
                'category_id' => $createdCategories[2]->id, // Nouveautés & Drops
                'author_id' => $admin->id,
                'tags' => ['drops', 'nouveautés', '2026', 'hype'],
                'published_at' => now()->subDays(2),
                'is_featured' => false,
                'read_time' => 8,
                'views' => 2134,
            ],
            [
                'title' => 'L\'histoire des Air Jordan : de la NBA aux streets',
                'excerpt' => 'Retour sur 40 ans de légende. Comment les Air Jordan ont révolutionné la culture sneakers mondiale.',
                'content' => '<h2>1985 : La naissance d\'une icône</h2>
                <p>Tout commence en 1985 quand Nike signe un contrat avec un jeune joueur prometteur : Michael Jordan. Ce qui était initialement un pari commercial va devenir la franchise sneakers la plus lucrative de l\'histoire.</p>
                
                <h3>La controverse NBA</h3>
                <p>Les premières Air Jordan 1 en coloris "Bred" (noir et rouge) enfreignent le code vestimentaire de la NBA. Nike paie les amendes et transforme cette interdiction en génie marketing.</p>
                
                <h3>L\'expansion culturelle</h3>
                <p>Dans les années 90, les Air Jordan dépassent le terrain de basket pour devenir un symbole de la culture hip-hop et streetwear. Spike Lee et son personnage Mars Blackmon popularisent la marque.</p>
                
                <h3>L\'héritage aujourd\'hui</h3>
                <p>40 ans plus tard, les retros de Air Jordan se vendent en quelques minutes. La marque Jordan Brand génère plus de 5 milliards de dollars par an.</p>
                
                <p>Les Air Jordan ne sont plus des chaussures, ce sont des pièces de collection, des œuvres d\'art portables qui racontent l\'histoire de la culture urbaine.</p>',
                'category_id' => $createdCategories[0]->id, // Sneaker Culture
                'author_id' => $admin->id,
                'tags' => ['histoire', 'air jordan', 'culture', 'michael jordan'],
                'published_at' => now()->subDays(10),
                'is_featured' => false,
                'read_time' => 10,
                'views' => 3421,
            ],
            [
                'title' => 'Street style : 5 façons de porter vos dunks',
                'excerpt' => 'Les Nike Dunk sont partout ! Découvrez comment les styler pour un look streetwear parfait.',
                'content' => '<h2>La polyvalence du Dunk</h2>
                <p>Les Nike Dunk sont devenues l\'une des silhouettes les plus populaires du streetwear. Voici 5 looks pour les porter avec style.</p>
                
                <h3>1. Le look minimaliste</h3>
                <p>Jean slim noir, t-shirt blanc oversize, Dunk Low monochrome. Simple mais efficace.</p>
                
                <h3>2. Le techwear urbain</h3>
                <p>Cargo pants, veste technique, Dunk High en coloris sombres. Perfect pour les jours pluvieux.</p>
                
                <h3>3. Le casual weekend</h3>
                <p>Short en jean, hoodie vintage, Dunk Low colorées. Confort et style assurés.</p>
                
                <h3>4. Le prep revisité</h3>
                <p>Chino beige, chemise oxford, Dunk Low "University Blue". Preppy avec une touche street.</p>
                
                <h3>5. Le total look sportswear</h3>
                <p>Survêtement rétro, Dunk High vintage. L\'hommage aux 80s.</p>
                
                <p>L\'astuce : laissez les Dunk être la pièce maîtresse de votre outfit. Gardez le reste simple pour les mettre en valeur.</p>',
                'category_id' => $createdCategories[3]->id, // Streetwear
                'author_id' => $admin->id,
                'tags' => ['style', 'dunk', 'outfit', 'streetwear'],
                'published_at' => now()->subDays(7),
                'is_featured' => false,
                'read_time' => 5,
                'views' => 1876,
            ],
        ];

        foreach ($posts as $postData) {
            // Générer une image de placeholder (vous remplacerez avec de vraies images)
            $postData['cover_image'] = 'blog/placeholder-' . rand(1, 10) . '.jpg';
            
            // SEO meta
            $postData['seo_meta'] = [
                'title' => $postData['title'] . ' | ENMA SPA Blog',
                'description' => $postData['excerpt'],
                'keywords' => implode(', ', $postData['tags']),
            ];

            BlogPost::create($postData);
        }

        $this->command->info('✅ Blog seeder terminé : 4 catégories et 4 articles créés');
        $this->command->info('🔗 Accédez au blog : /blog');
    }
}
