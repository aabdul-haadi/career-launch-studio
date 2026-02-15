import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Brain, Sparkles, ArrowRight, CheckCircle2, Search, Linkedin, MessageSquare, Mail, Rocket, Shield, Zap, ChevronDown, Award, Target, TrendingUp, Users, Star, Hexagon, CircleDot, Diamond, GraduationCap, Briefcase, Building2, Pill, Microscope, Beaker, FlaskRound, Syringe, Stethoscope } from 'lucide-react';
import heroImage from '@/assets/hero-pharmacist.jpg';

// Add pharmacy-specific icons
const pharmacyIcons = {
  pill: Pill,
  microscope: Microscope,
  beaker: Beaker,
  flask: FlaskRound,
  syringe: Syringe,
  stethoscope: Stethoscope,
  building: Building2,
  graduation: GraduationCap,
  briefcase: Briefcase,
  hexagon: Hexagon,
  circle: CircleDot,
  diamond: Diamond,
};

// Optimized animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.08, 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1] 
    },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const workflowSteps = [
  {
    icon: FileText,
    title: 'Submit Profile',
    desc: 'Quick form with your education, skills & goals',
    color: 'from-[hsl(174,63%,40%)] to-[hsl(174,63%,55%)]',
    bg: 'bg-[hsl(174,63%,40%)/0.05]',
    pattern: 'radial-gradient(circle at 20% 30%, hsl(174,63%,40%/0.1) 0%, transparent 50%)',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    desc: 'Real-time coaching to strengthen your profile',
    color: 'from-[hsl(222,47%,15%)] to-[hsl(222,47%,30%)]',
    bg: 'bg-[hsl(222,47%,15%)/0.05]',
    pattern: 'linear-gradient(45deg, hsl(222,47%,15%/0.1) 0%, transparent 70%)',
  },
  {
    icon: Sparkles,
    title: 'Generate Docs',
    desc: 'CV, cover letters, LinkedIn & interview prep',
    color: 'from-[hsl(38,92%,50%)] to-[hsl(38,92%,60%)]',
    bg: 'bg-[hsl(38,92%,50%)/0.05]',
    pattern: 'repeating-linear-gradient(45deg, hsl(38,92%,50%/0.1) 0px, hsl(38,92%,50%/0.1) 2px, transparent 2px, transparent 10px)',
  },
  {
    icon: Rocket,
    title: 'Launch Ready',
    desc: 'Download your complete career pack PDF',
    color: 'from-[hsl(158,64%,40%)] to-[hsl(158,64%,55%)]',
    bg: 'bg-[hsl(158,64%,40%)/0.05]',
    pattern: 'radial-gradient(circle at 80% 70%, hsl(158,64%,40%/0.1) 0%, transparent 40%)',
  },
];

const features = [
  { 
    icon: FileText, 
    title: 'Professional CV', 
    desc: 'ATS-optimized for pharmacy',
    stats: '93% interview rate',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/5',
    pattern: 'radial-gradient(circle at 0% 0%, blue/0.1 0%, transparent 50%)',
  },
  { 
    icon: Mail, 
    title: 'Cover Letters', 
    desc: 'Hospital, industry, community',
    stats: '3 variants included',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/5',
    pattern: 'linear-gradient(135deg, emerald/0.1 0%, transparent 50%)',
  },
  { 
    icon: Linkedin, 
    title: 'LinkedIn Profile', 
    desc: 'Optimized for recruiters',
    stats: '10x more views',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/5',
    pattern: 'repeating-linear-gradient(45deg, purple/0.05 0px, purple/0.05 5px, transparent 5px, transparent 15px)',
  },
  { 
    icon: MessageSquare, 
    title: 'Interview Prep', 
    desc: '50+ Q&A with answers',
    stats: '95% success rate',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/5',
    pattern: 'radial-gradient(circle at 100% 100%, amber/0.1 0%, transparent 50%)',
  },
  { 
    icon: Target, 
    title: 'Career Roadmap', 
    desc: 'Personalized growth plan',
    stats: '5-year trajectory',
    color: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-500/5',
    pattern: 'linear-gradient(0deg, indigo/0.1 0%, transparent 50%)',
  },
  { 
    icon: Award, 
    title: 'Certifications', 
    desc: 'Relevant courses & badges',
    stats: 'Industry recognized',
    color: 'from-rose-500 to-red-500',
    bg: 'bg-rose-500/5',
    pattern: 'repeating-radial-gradient(circle at 20% 30%, rose/0.1 0px, rose/0.1 5px, transparent 5px, transparent 15px)',
  },
  { 
    icon: Users, 
    title: 'Network Strategy', 
    desc: 'Connect with alumni',
    stats: '500+ connections',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/5',
    pattern: 'conic-gradient(from 90deg at 50% 50%, violet/0.1 0deg, transparent 60deg)',
  },
  { 
    icon: TrendingUp, 
    title: 'Salary Guide', 
    desc: 'Market insights & negotiation',
    stats: '20% higher offers',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/5',
    pattern: 'linear-gradient(90deg, green/0.1 0%, transparent 70%)',
  },
];

// Floating elements generator
const FloatingElement = ({ delay, x, y, children, color }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.2, 1],
      x: [0, x, 0],
      y: [0, y, 0],
      rotate: [0, 360, 0]
    }}
    transition={{
      duration: 12,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
  >
    <div className={`w-32 h-32 rounded-full ${color} blur-3xl`} />
  </motion.div>
);

// Pharmacy-themed background pattern component
const PharmacyPattern = ({ color, type }: { color: string, type: string }) => {
  const icons = Object.values(pharmacyIcons);
  const randomIcons = icons.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {type === 'dots' && (
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
      )}
      {type === 'grid' && (
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      )}
      {type === 'hexagon' && (
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52.5 17.5 L52.5 42.5 L30 55 L7.5 42.5 L7.5 17.5 L30 5' fill='none' stroke='${color}' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      )}
      {type === 'pharmacy' && (
        <div className="absolute inset-0 flex flex-wrap gap-8 p-8">
          {randomIcons.map((Icon, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, delay: i * 2, repeat: Infinity }}
              className="absolute"
              style={{ 
                left: `${Math.random() * 80}%`, 
                top: `${Math.random() * 80}%`,
                color: color
              }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Auto-sliding badges carousel for mobile
const AutoSlidingBadges = () => {
  const badges = [
    { label: 'ATS-Optimized', icon: CheckCircle2, color: 'text-blue-500' },
    { label: 'Industry Standard', icon: Award, color: 'text-purple-500' },
    { label: 'Recruiter Approved', icon: Star, color: 'text-amber-500' },
    { label: 'Instant Download', icon: Zap, color: 'text-green-500' },
    { label: 'AI-Powered', icon: Brain, color: 'text-teal-500' },
    { label: 'Free Consultation', icon: MessageSquare, color: 'text-indigo-500' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isPaused, badges.length]);

  return (
    <div className="md:hidden w-full overflow-hidden py-4">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsPaused(true)}
        onHoverEnd={() => setIsPaused(false)}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mx-auto w-fit"
      >
        {(() => {
          const BadgeIcon = badges[currentIndex].icon;
          return (
            <>
              <BadgeIcon className={`h-4 w-4 ${badges[currentIndex].color}`} />
              <span className="text-xs font-medium">{badges[currentIndex].label}</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-1"
              />
            </>
          );
        })()}
      </motion.div>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-2">
        {badges.map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: i === currentIndex ? 1.2 : 1,
              backgroundColor: i === currentIndex ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
            }}
            className="w-1.5 h-1.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

// Desktop static badges
const DesktopBadges = () => {
  const badges = [
    { label: 'ATS-Optimized', icon: CheckCircle2, color: 'text-blue-500' },
    { label: 'Industry Standard', icon: Award, color: 'text-purple-500' },
    { label: 'Recruiter Approved', icon: Star, color: 'text-amber-500' },
    { label: 'Instant Download', icon: Zap, color: 'text-green-500' },
  ];

  return (
    <div className="hidden md:flex flex-wrap justify-center gap-4 mt-12">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          whileHover={{ scale: 1.1, y: -2 }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 text-sm shadow-sm hover:shadow-md transition-all"
        >
          <badge.icon className={`h-4 w-4 ${badge.color}`} />
          <span className="text-xs font-medium">{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const [navBg, setNavBg] = useState('bg-transparent');
  
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.03]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.05) {
      setNavBg('bg-background/80 backdrop-blur-lg border-b border-border/50');
    } else {
      setNavBg('bg-transparent');
    }
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <motion.img 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              src="/career-icon.png" 
              alt="Career Launch Pack" 
              className="h-7 w-7 object-contain"
            />
            <span className={`font-serif text-base font-bold ${navBg === 'bg-transparent' ? 'text-white drop-shadow-md' : 'text-foreground'}`}>
              Career Pack
            </span>
          </motion.div>
          <Link to="/status">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="sm" 
                className={`h-8 px-3 ${
                  navBg === 'bg-transparent' 
                    ? 'bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20' 
                    : 'bg-background border-border text-foreground hover:bg-accent'
                }`}
              >
                <Search className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Status</span>
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section - Navy Gradient */}
      <header className="relative pt-14 min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[hsl(222,47%,11%)] via-[hsl(222,47%,15%)] to-[hsl(174,63%,20%)]">
        {/* Animated pharmacy icons in background */}
        <PharmacyPattern color="hsl(174,63%,70%)" type="pharmacy" />
        
       <motion.div
  style={{ scale: heroScale, opacity: heroOpacity }}
  className="absolute inset-0 hidden md:block mix-blend-overlay opacity-20"
>
  <img
    src={heroImage}
    alt="Pharmacist"
    className="w-full h-full object-cover object-top"
  />
</motion.div>



        {/* Animated floating elements with pharmacy theme */}
        <FloatingElement delay={0} x={30} y={20} color="bg-[hsl(174,63%,40%)]" />
        <FloatingElement delay={2} x={-20} y={40} color="bg-[hsl(38,92%,50%)]" />
        <FloatingElement delay={4} x={50} y={-30} color="bg-[hsl(222,47%,30%)]" />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto md:mx-0">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div custom={0} variants={fadeUp}>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  AI-Powered Career Intelligence
                </motion.span>
              </motion.div>
              
              <motion.h1 custom={1} variants={fadeUp} className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3 text-center md:text-left">
                Launch Your
                <motion.span 
                  animate={{ 
                    textShadow: ['0 0 8px hsl(174,63%,50%)', '0 0 16px hsl(174,63%,50%)', '0 0 8px hsl(174,63%,50%)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="block text-[hsl(174,63%,50%)]"
                >
                  Pharmacy Career
                </motion.span>
              </motion.h1>
              
              <motion.p custom={2} variants={fadeUp} className="text-base text-white/70 mb-6 max-w-lg text-center md:text-left mx-auto md:mx-0">
                Complete career pack — CV, cover letters, LinkedIn & interview prep — tailored to your profile.
              </motion.p>

              {/* Mobile hero image with overlay */}
              <motion.div 
                custom={2.5} 
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                className="md:hidden mb-6 rounded-xl overflow-hidden mx-auto max-w-xs shadow-2xl"
              >
                <img
                  src={heroImage}
                  alt="Pharmacist"
                  className="w-full h-36 object-cover"
                />
              </motion.div>

              <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                <Link to="/apply" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="default" 
                      className="bg-white text-[hsl(222,47%,11%)] hover:bg-white/90 text-sm px-6 py-2 h-auto w-full sm:w-auto font-semibold border-0 shadow-lg hover:shadow-xl transition-all"
                    >
                      Start Application
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/status" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="default" 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 hover:text-white text-sm px-6 py-2 h-auto w-full sm:w-auto bg-transparent backdrop-blur-sm"
                    >
                      <Search className="mr-1.5 h-4 w-4" />
                      Track Pack
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block"
        >
          <ChevronDown className="h-5 w-5 text-white/50" />
        </motion.div>
      </header>

      {/* What You'll Get Section - Teal Gradient with Pharmacy Pattern */}
      <section className="py-10 relative overflow-hidden bg-gradient-to-br from-[hsl(174,63%,40%)/0.1] via-transparent to-[hsl(222,47%,30%)/0.1]">
        <PharmacyPattern color="hsl(174,63%,40%)" type="hexagon" />
        
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-[hsl(174,63%,40%)/0.2] to-[hsl(222,47%,30%)/0.2] blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-r from-[hsl(38,92%,50%)/0.2] to-[hsl(158,64%,40%)/0.2] blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(174,63%,40%)/0.2] border border-[hsl(174,63%,40%)/0.3] mb-4"
            >
              <Star className="h-4 w-4 text-[hsl(174,63%,40%)]" />
              <span className="text-sm font-medium text-[hsl(174,63%,40%)]">Complete Career Arsenal</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3"
            >
              What You'll{' '}
              <motion.span
                animate={{ 
                  color: ['hsl(174,63%,40%)', 'hsl(38,92%,50%)', 'hsl(222,47%,30%)', 'hsl(174,63%,40%)']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="inline-block"
              >
                Get
              </motion.span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-base text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to stand out in the competitive pharmacy job market
            </motion.p>

            {/* Animated underline */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-[hsl(174,63%,40%)] via-[hsl(38,92%,50%)] to-[hsl(222,47%,30%)] rounded-full mx-auto mt-4"
            />
          </motion.div>

          {/* Stats Counter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-8 mb-12"
          >
            {[
              { value: '8', label: 'Career Tools', icon: FileText, color: 'text-[hsl(174,63%,40%)]' },
              { value: '93%', label: 'Success Rate', icon: TrendingUp, color: 'text-[hsl(38,92%,50%)]' },
              { value: '500+', label: 'Active Users', icon: Users, color: 'text-[hsl(222,47%,30%)]' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.4 + i * 0.1 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(${174+i*36},63%,40%)/0.2] to-[hsl(${38+i*92},92%,50%)/0.2] flex items-center justify-center mx-auto mb-2`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`font-bold text-2xl text-foreground ${stat.color}`}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group perspective"
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`h-full ${feature.bg} backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                  style={{
                    backgroundImage: feature.pattern,
                  }}
                >
                  {/* Animated gradient background on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 0.2, scale: 2 }}
                    transition={{ duration: 0.4 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />

                  {/* Icon with floating animation */}
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: index * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 relative z-10 shadow-lg`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-serif font-semibold text-sm mb-1 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 relative z-10">
                    {feature.desc}
                  </p>

                  {/* Stats badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-[10px] font-medium text-primary relative z-10"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1 h-1 rounded-full bg-primary"
                    />
                    {feature.stats}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Badges - Auto-sliding on mobile, static on desktop */}
          <AutoSlidingBadges />
          <DesktopBadges />
        </div>
      </section>

      {/* How It Works Section - Amber Gradient */}
      <section className="py-5 relative overflow-hidden bg-gradient-to-br from-[hsl(38,92%,50%)/0.15] via-transparent to-[hsl(174,63%,40%)/0.15]">
        <PharmacyPattern color="hsl(38,92%,50%)" type="dots" />
        
        <div className="absolute inset-0 opacity-5" style={{ 
          background: 'repeating-linear-gradient(45deg, hsl(38,92%,50%) 0px, hsl(38,92%,50%) 2px, transparent 2px, transparent 20px)'
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">How It Works</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Four simple steps to career-ready</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="relative flex items-start gap-3 mb-4 last:mb-0"
                style={{
                  background: step.pattern,
                }}
              >
                {/* Step number with pulse animation */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 0 0 hsl(var(--primary)/0.3)',
                      '0 0 0 4px hsl(var(--primary)/0.1)',
                      '0 0 0 0 hsl(var(--primary)/0.3)'
                    ]
                  }}
                  transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${step.bg} border border-primary/20 flex items-center justify-center font-bold text-primary text-xs z-10`}
                >
                  {i + 1}
                </motion.div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.01, x: 5 }}
                  className={`flex-1 ${step.bg} backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-sm hover:shadow transition-all duration-200`}
                  style={{
                    backgroundImage: step.pattern,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-6 h-6 rounded bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}
                    >
                      <step.icon className="h-3.5 w-3.5 text-white" />
                    </motion.div>
                    <h3 className="font-serif text-sm font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link to="/apply">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="default" 
                  className="bg-gradient-to-r from-[hsl(38,92%,50%)] to-[hsl(38,92%,60%)] text-white hover:opacity-90 text-sm px-8 py-2 h-auto shadow-lg hover:shadow-xl transition-all border-0"
                >
                  Get Started — Free
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Section - Purple Gradient */}
      <section className="py-10 relative overflow-hidden bg-gradient-to-br from-[hsl(222,47%,30%)/0.2] via-transparent to-[hsl(174,63%,40%)/0.2]">
        <PharmacyPattern color="hsl(222,47%,30%)" type="grid" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 max-w-xl mx-auto">
            {[
              { icon: Shield, label: 'Secure & Private', color: 'text-blue-500' },
              { icon: Zap, label: 'AI-Powered', color: 'text-amber-500' },
              { icon: CheckCircle2, label: 'Professional Quality', color: 'text-green-500' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  className={`w-6 h-6 rounded-full bg-gradient-to-br from-${item.color}/20 to-transparent flex items-center justify-center`}
                >
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                </motion.div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Navy Gradient */}
      <footer className="relative overflow-hidden border-t border-border/50 py-4 bg-gradient-to-r from-[hsl(222,47%,11%)] to-[hsl(222,47%,15%)]">
        <PharmacyPattern color="hsl(174,63%,40%)" type="pharmacy" />
        
        <div className="container mx-auto px-4 flex items-center justify-between text-xs text-white/70 relative z-10">
          <motion.p whileHover={{ color: 'hsl(174,63%,50%)' }}>
            © {new Date().getFullYear()} Career Pack
          </motion.p>
          <motion.a
            href="https://www.instagram.com/ariishaslife?igsh=MXdpczUyaDhrZmNhYQ=="
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, color: 'hsl(174,63%,50%)' }}
            className="hover:underline"
          >
            @ariishaslife
          </motion.a>
        </div>
      </footer>
    </div>
  );
}