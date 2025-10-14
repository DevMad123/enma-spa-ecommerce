import React from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useAppSettings } from '@/Hooks/useAppSettings';
import { 
    DocumentTextIcon,
    ShieldCheckIcon,
    ScaleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserIcon,
    CreditCardIcon,
    TruckIcon
} from '@heroicons/react/24/outline';

const SectionCard = ({ icon: Icon, title, children, gradient }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="text-gray-600 leading-relaxed space-y-4">
                {children}
            </div>
        </div>
    );
};

const HighlightBox = ({ type = "info", children }) => {
    const styles = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        success: "bg-green-50 border-green-200 text-green-800"
    };

    const icons = {
        info: InformationCircleIcon,
        warning: ExclamationTriangleIcon,
        success: CheckCircleIcon
    };

    const Icon = icons[type];

    return (
        <div className={`p-4 rounded-xl border ${styles[type]}`}>
            <div className="flex items-start">
                <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
};

export default function Terms() {
    const { appSettings, formatDate, formatCurrency } = useAppSettings();
    const appName = appSettings?.app_name || 'ENMA SPA';
    const companyAddress = appSettings?.company_address || 'Abidjan, Côte d\'Ivoire';
    const contactEmail = appSettings?.contact_email || 'contact@enmaspa.com';
    
    return (
        <FrontendLayout title={`Conditions Générales - ${appName}`}>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-slate-600 to-blue-600 mb-8">
                            <DocumentTextIcon className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Conditions Générales
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Découvrez les conditions qui régissent l'utilisation de notre site et l'achat de nos produits.
                        </p>
                        <div className="mt-8 text-sm text-gray-500">
                            Dernière mise à jour : {formatDate(new Date().toISOString(), { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Introduction */}
                <SectionCard 
                    icon={InformationCircleIcon}
                    title="Introduction"
                    gradient="from-blue-500 to-blue-600"
                >
                    <p>
                        Les présentes conditions générales de vente (CGV) régissent les relations contractuelles 
                        entre {appName}, société immatriculée en Côte d'Ivoire, 
                        dont le siège social est situé {companyAddress}, ci-après dénommée "le Vendeur", 
                        et toute personne physique ou morale souhaitant effectuer un achat sur le site internet, 
                        ci-après dénommée "l'Acheteur" ou "le Client".
                    </p>
                    <HighlightBox type="info">
                        <strong>Important :</strong> Toute commande implique l'acceptation sans réserve des présentes 
                        conditions générales de vente qui prévalent sur toutes autres conditions.
                    </HighlightBox>
                </SectionCard>

                {/* Article 1 - Objet */}
                <SectionCard 
                    icon={DocumentTextIcon}
                    title="Article 1 - Objet"
                    gradient="from-slate-500 to-slate-600"
                >
                    <p>
                        Les présentes conditions générales ont pour objet de définir les droits et obligations 
                        des parties dans le cadre de la vente en ligne de produits proposés par ENMA SPA.
                    </p>
                    <p>
                        Elles s'appliquent à toutes les commandes passées sur le site www.enmaspa.com et 
                        sont accessibles à tout moment sur le site. Le Client déclare avoir pris connaissance 
                        de ces conditions générales et les accepter sans réserve.
                    </p>
                </SectionCard>

                {/* Article 2 - Produits */}
                <SectionCard 
                    icon={CheckCircleIcon}
                    title="Article 2 - Produits et Services"
                    gradient="from-green-500 to-green-600"
                >
                    <p>
                        Les produits proposés sont ceux qui figurent sur le site www.enmaspa.com, dans la 
                        limite des stocks disponibles. Chaque produit est accompagné d'un descriptif mentionnant 
                        ses caractéristiques essentielles.
                    </p>
                    <p>
                        Les photographies illustrant les produits n'entrent pas dans le champ contractuel. 
                        Seules les caractéristiques techniques mentionnées dans le descriptif de chaque produit 
                        ont une valeur contractuelle.
                    </p>
                    <HighlightBox type="warning">
                        <strong>Attention :</strong> Les couleurs des produits peuvent légèrement différer de 
                        celles affichées à l'écran en raison des paramètres de votre moniteur.
                    </HighlightBox>
                </SectionCard>

                {/* Article 3 - Prix */}
                <SectionCard 
                    icon={CreditCardIcon}
                    title="Article 3 - Prix"
                    gradient="from-amber-500 to-orange-600"
                >
                    <p>
                        Les prix figurant sur le site sont exprimés en euros, toutes taxes comprises (TTC), 
                        hors frais de traitement et d'expédition. Les frais de livraison sont indiqués avant 
                        la validation définitive de la commande.
                    </p>
                    <p>
                        ENMA SPA se réserve le droit de modifier ses prix à tout moment. Les produits seront 
                        facturés sur la base des tarifs en vigueur au moment de l'enregistrement des commandes.
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>TVA applicable : 20% (taux en vigueur)</li>
                        <li>Livraison gratuite : commandes supérieures à 50€</li>
                        <li>Frais de livraison standard : 4,90€</li>
                        <li>Livraison express : 9,90€</li>
                    </ul>
                </SectionCard>

                {/* Article 4 - Commande */}
                <SectionCard 
                    icon={UserIcon}
                    title="Article 4 - Commande"
                    gradient="from-purple-500 to-purple-600"
                >
                    <p>
                        Les commandes sont passées exclusivement sur le site www.enmaspa.com. Le Client 
                        sélectionne les produits qu'il désire commander et les place dans son panier virtuel.
                    </p>
                    <p>
                        Le processus de commande comprend les étapes suivantes :
                    </p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Sélection des produits et ajout au panier</li>
                        <li>Vérification du contenu du panier</li>
                        <li>Identification ou création d'un compte client</li>
                        <li>Choix de l'adresse de livraison</li>
                        <li>Choix du mode de livraison</li>
                        <li>Choix du mode de paiement</li>
                        <li>Vérification et validation de la commande</li>
                    </ol>
                    <HighlightBox type="success">
                        Un email de confirmation vous sera envoyé à l'adresse indiquée lors de la commande.
                    </HighlightBox>
                </SectionCard>

                {/* Article 5 - Paiement */}
                <SectionCard 
                    icon={CreditCardIcon}
                    title="Article 5 - Paiement"
                    gradient="from-indigo-500 to-indigo-600"
                >
                    <p>
                        Le paiement des commandes s'effectue au moment de la passation de la commande. 
                        Les modes de paiement acceptés sont :
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Cartes bancaires (Visa, MasterCard, American Express)</li>
                        <li>PayPal</li>
                        <li>Virement bancaire (pour les commandes professionnelles)</li>
                        <li>Paiement en 3 fois sans frais (à partir de 100€)</li>
                    </ul>
                    <p>
                        Les données de paiement sont cryptées et sécurisées. ENMA SPA ne conserve aucune 
                        information relative aux moyens de paiement utilisés.
                    </p>
                </SectionCard>

                {/* Article 6 - Livraison */}
                <SectionCard 
                    icon={TruckIcon}
                    title="Article 6 - Livraison"
                    gradient="from-blue-500 to-cyan-600"
                >
                    <p>
                        Les produits sont livrés à l'adresse de livraison indiquée lors de la commande. 
                        Les délais de livraison sont donnés à titre indicatif et peuvent varier selon 
                        la destination et la disponibilité des produits.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">France métropolitaine :</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Standard : 3-5 jours ouvrés</li>
                                <li>• Express : 1-2 jours ouvrés</li>
                                <li>• Premium : Livraison le jour même</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">International :</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Europe : 4-7 jours ouvrés</li>
                                <li>• Monde : 7-21 jours ouvrés</li>
                                <li>• Express international disponible</li>
                            </ul>
                        </div>
                    </div>
                </SectionCard>

                {/* Article 7 - Droit de rétractation */}
                <SectionCard 
                    icon={ScaleIcon}
                    title="Article 7 - Droit de rétractation"
                    gradient="from-emerald-500 to-emerald-600"
                >
                    <p>
                        Conformément à l'article L.121-21 du Code de la consommation, le Client dispose 
                        d'un délai de 14 jours francs à compter de la réception de sa commande pour exercer 
                        son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.
                    </p>
                    <p>
                        Pour exercer ce droit, le Client doit nous notifier sa décision au moyen d'une 
                        déclaration dénuée d'ambiguïté par email à l'adresse : retours@enmaspa.com
                    </p>
                    <HighlightBox type="warning">
                        <strong>Conditions de retour :</strong> Les produits doivent être retournés dans leur 
                        état d'origine, complets (accessoires, emballage, notice...) et dans leur emballage 
                        d'origine ou un emballage équivalent.
                    </HighlightBox>
                </SectionCard>

                {/* Article 8 - Garanties */}
                <SectionCard 
                    icon={ShieldCheckIcon}
                    title="Article 8 - Garanties"
                    gradient="from-red-500 to-red-600"
                >
                    <p>
                        Tous nos produits bénéficient de la garantie légale de conformité et de la garantie 
                        contre les vices cachés, prévues par les articles 1641 et suivants du Code civil.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Garantie de conformité :</h4>
                            <p className="text-sm">
                                Le Client peut obtenir le remplacement ou la réparation du bien ou, 
                                à défaut, la réduction du prix ou la résolution de la vente.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Garantie des vices cachés :</h4>
                            <p className="text-sm">
                                Le Client peut choisir entre la résolution de la vente ou une réduction 
                                du prix de vente conformément à l'article 1644 du Code civil.
                            </p>
                        </div>
                    </div>
                </SectionCard>

                {/* Article 9 - Responsabilité */}
                <SectionCard 
                    icon={ExclamationTriangleIcon}
                    title="Article 9 - Responsabilité"
                    gradient="from-orange-500 to-red-500"
                >
                    <p>
                        ENMA SPA ne saurait être tenue responsable de l'inexécution du contrat conclu 
                        en cas de rupture de stock ou d'indisponibilité du produit, de force majeure, 
                        de perturbation ou grève totale ou partielle des services postaux et moyens 
                        de transport et/ou communications.
                    </p>
                    <p>
                        En cas de dommage, la responsabilité de ENMA SPA ne pourra excéder le montant 
                        de la commande concernée.
                    </p>
                </SectionCard>

                {/* Article 10 - Données personnelles */}
                <SectionCard 
                    icon={ShieldCheckIcon}
                    title="Article 10 - Protection des données personnelles"
                    gradient="from-violet-500 to-violet-600"
                >
                    <p>
                        ENMA SPA s'engage à préserver la confidentialité des informations fournies par 
                        le Client. Les données personnelles collectées sont nécessaires au traitement 
                        et à l'exécution de la commande ainsi qu'à l'établissement des factures.
                    </p>
                    <p>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), 
                        le Client dispose d'un droit d'accès, de rectification, de suppression et 
                        de portabilité de ses données personnelles.
                    </p>
                    <HighlightBox type="info">
                        Pour exercer ces droits, contactez-nous à l'adresse : privacy@enmaspa.com
                    </HighlightBox>
                </SectionCard>

                {/* Article 11 - Droit applicable */}
                <SectionCard 
                    icon={ScaleIcon}
                    title="Article 11 - Droit applicable et juridiction"
                    gradient="from-slate-500 to-gray-600"
                >
                    <p>
                        Les présentes conditions générales de vente sont régies par le droit français. 
                        En cas de litige, et après échec de toute tentative de règlement amiable, 
                        les tribunaux français seront seuls compétents.
                    </p>
                    <p>
                        Pour toute réclamation, le Client peut s'adresser en priorité à notre service 
                        client à l'adresse : contact@enmaspa.com ou par courrier postal à notre adresse.
                    </p>
                </SectionCard>

                {/* Contact section */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Des questions sur nos conditions ?</h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Notre équipe juridique est disponible pour répondre à toutes vos questions 
                        concernant nos conditions générales de vente.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                            href={route('contact')} 
                            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-200"
                        >
                            Nous contacter
                        </a>
                        <a 
                            href="mailto:legal@enmaspa.com" 
                            className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200"
                        >
                            Service juridique
                        </a>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}