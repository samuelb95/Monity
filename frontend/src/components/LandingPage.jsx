import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Target,
  PieChart,
  ArrowRight,
  CheckCircle,
  Shield,
  Smartphone,
  Zap,
  Menu,
  X,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { BudgetPlanningAnimation } from './animations/BudgetPlanningAnimation';
import { RealTimeTrackingAnimation } from './animations/RealTimeTrackingAnimation';
import { SavingsGoalAnimation } from './animations/SavingsGoalAnimation';
import { SharedBudgetAnimation } from './animations/SharedBudgetAnimation';

export const LandingPage = ({ onGetStarted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Planification intelligente",
      description: "Définissez vos revenus et répartissez-les selon vos priorités dans trois catégories : Charge, Épargne et Loisir.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Suivi en temps réel",
      description: "Visualisez vos dépenses et vos objectifs à tout moment. Des graphiques clairs vous montrent où va votre argent.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Budget partagé",
      description: "Gérez vos finances à deux ou en groupe avec des comptes communs. Le système calcule automatiquement qui doit combien à qui.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Objectifs d'épargne",
      description: "Préparez vos projets (vacances, achats, rénovations) sans stress. Suivez votre progression vers vos objectifs.",
    }
  ];

  const benefits = [
    { icon: <Shield className="w-5 h-5" />, text: "Sécurisé avec authentification" },
    { icon: <Zap className="w-5 h-5" />, text: "Calculs automatiques" },
    { icon: <Smartphone className="w-5 h-5" />, text: "Interface optimisée" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Gratuit et sans engagement" }
  ];

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "À propos", href: "#about" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Monity
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={onGetStarted}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors font-medium"
              >
                Se connecter
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-md transition-all shadow-md"
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <button 
                    onClick={onGetStarted}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-md w-full transition-colors"
                  >
                    Se connecter
                  </button>
                  <button 
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-md w-full transition-all"
                  >
                    Commencer gratuitement
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-20 md:py-32"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">Application de gestion de budget</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Prenez le contrôle de votre budget, simplement.
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Planifiez, suivez et optimisez vos dépenses chaque mois grâce à une application claire et intelligente. Gérez vos finances seul ou en groupe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-md flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                >
                  Créer un compte gratuitement
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={onGetStarted}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-8 rounded-md transition-all"
                >
                  Se connecter
                </button>
              </div>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="text-green-600">
                      {benefit.icon}
                    </div>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Right Side - Budget Preview Card */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold">
                  ✓ Gratuit
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Budget mensuel</span>
                    <span className="font-bold text-lg">2,500 €</span>
                  </div>
                  <div className="space-y-4">
                    {/* Charge */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Charge</span>
                        <span className="text-gray-600">1,200 € / 1,500 €</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                    
                    {/* Épargne */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Épargne</span>
                        <span className="text-gray-600">400 € / 700 €</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '57%' }} />
                      </div>
                    </div>
                    
                    {/* Loisir */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 font-medium">Loisir</span>
                        <span className="text-gray-600">180 € / 300 €</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative blur elements */}
              <div className="absolute -z-10 top-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute -z-10 bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Problem Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Decorative background elements - maintaining existing theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 font-medium"
              >
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                Le défi actuel
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
                Gérer son budget, c'est <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">plus complexe</span> que jamais
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Problem 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border border-blue-200"
              >
                <div className="mb-4 text-5xl">📊</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Trop de sources d'argent</h3>
                <p className="text-gray-700 leading-relaxed">
                  Salaire, revenus supplémentaires, cadeaux... Tout se mélange et il devient impossible de savoir où part votre argent.
                </p>
              </motion.div>

              {/* Problem 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border border-purple-200"
              >
                <div className="mb-4 text-5xl">💸</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Dépenses imprévisibles</h3>
                <p className="text-gray-700 leading-relaxed">
                  Abonnements oubliés, réparations urgentes, achats impulsifs... qui dépassent votre budget sans prévenir.
                </p>
              </motion.div>

              {/* Problem 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="group bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all border border-indigo-200"
              >
                <div className="mb-4 text-5xl">😰</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Manque de visibilité</h3>
                <p className="text-gray-700 leading-relaxed">
                  Pas de vue d'ensemble claire. Stress constant et sentiment de perte de contrôle sur vos finances.
                </p>
              </motion.div>
            </div>

            {/* Impact Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white"
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-3">😟</div>
                  <div className="text-2xl font-bold mb-2">Stress</div>
                  <p className="text-blue-100">Anxiété permanente sur vos dépenses</p>
                </div>
                <div className="text-center border-l border-r border-blue-300">
                  <div className="text-4xl font-bold mb-3">📉</div>
                  <div className="text-2xl font-bold mb-2">Dépassements</div>
                  <p className="text-blue-100">Budgets explosés sans comprendre pourquoi</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-3">🌀</div>
                  <div className="text-2xl font-bold mb-2">Confusion</div>
                  <p className="text-blue-100">Impossible de planifier ou économiser</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-white via-blue-50 to-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8 font-medium"
            >
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
              Fonctionnalités puissantes
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">Une solution pensée pour vous</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment notre application simplifie la gestion de vos finances personnelles et partagées.
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto space-y-24">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                    <motion.div 
                      className={`p-10 md:p-14 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-2' : ''}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.1, duration: 0.6 }}
                    >
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="text-4xl font-bold mb-6 text-gray-900">{feature.title}</h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        {feature.description}
                      </p>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all group"
                      >
                        <span>Explorez cette fonctionnalité</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className={`relative min-h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden flex items-center justify-center ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.2, duration: 0.6 }}
                    >
                      <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm shadow-lg z-10 font-medium text-gray-700">
                        ✨ Animation interactive
                      </div>
                      {index === 0 && <BudgetPlanningAnimation />}
                      {index === 1 && <RealTimeTrackingAnimation />}
                      {index === 2 && <SharedBudgetAnimation />}
                      {index === 3 && <SavingsGoalAnimation />}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Un tableau de bord clair et intuitif</h2>
              <p className="text-xl text-blue-100">
                Visualisez vos dépenses, vos objectifs et vos progrès en un coup d'œil
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <PieChart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold mb-1">3</div>
                  <div className="text-sm text-gray-600">Catégories personnalisées</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold mb-1">5</div>
                  <div className="text-sm text-gray-600">Groupes partagés</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-gray-600">Calculs automatiques</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold">Fonctionnalités clés :</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span>Graphiques en temps réel pour chaque catégorie</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span>Historique complet des transactions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span>Gestion multi-groupes avec calcul des contributions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span>Interface responsive et moderne</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Commencez à maîtriser votre budget dès aujourd'hui
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Rejoignez des milliers d'utilisateurs qui ont repris le contrôle de leurs finances
            </p>
            <button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-3 px-8 rounded-lg flex items-center justify-center gap-2 mx-auto transition-all shadow-lg hover:shadow-xl"
            >
              Créer un compte gratuitement
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Aucune carte bancaire requise • Gratuit pour toujours
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Monity</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Votre application de gestion de budget personnelle et collaborative
                </p>
                {/* Social Media */}
                <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4">Produit</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sécurité</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold mb-4">Entreprise</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">Qui sommes-nous</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Notre mission</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carrières</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>

              {/* Legal & Contact */}
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:contact@monity.com" className="text-gray-400 hover:text-white transition-colors">
                      contact@monity.com
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-gray-400">+33 1 23 45 67 89</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="text-gray-400">Paris, France</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <p>© 2026 Monity. Tous droits réservés.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Cookies</a>
                  <a href="#" className="hover:text-white transition-colors">Accessibilité</a>
                  <a href="#" className="hover:text-white transition-colors">Plan du site</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};