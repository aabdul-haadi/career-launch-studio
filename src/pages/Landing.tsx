import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Brain, Sparkles, ArrowRight, CheckCircle2, Search, Linkedin, MessageSquare, Mail, Rocket, Shield, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-pharmacist.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const workflowSteps = [
  {
    icon: FileText,
    title: 'Submit Your Profile',
    desc: 'Fill in your education, experience, skills, and career goals through our guided form.',
    color: 'from-[hsl(174,63%,40%)] to-[hsl(174,63%,55%)]',
  },
  {
    icon: Brain,
    title: 'AI Analysis & Coaching',
    desc: 'Our AI coach reviews your profile and provides real-time suggestions to strengthen your application.',
    color: 'from-[hsl(222,47%,15%)] to-[hsl(222,47%,30%)]',
  },
  {
    icon: Sparkles,
    title: 'Document Generation',
    desc: 'Professional CV, cover letters, LinkedIn optimization, and interview prep — all generated live.',
    color: 'from-[hsl(38,92%,50%)] to-[hsl(38,92%,60%)]',
  },
  {
    icon: Rocket,
    title: 'Career Pack Delivered',
    desc: 'Download your branded Career Launch Pack PDF, ready to use for applications and interviews.',
    color: 'from-[hsl(158,64%,40%)] to-[hsl(158,64%,55%)]',
  },
];

const features = [
  { icon: FileText, title: 'Professional CV', desc: 'ATS-optimized, single-column resume tailored for pharmacy roles' },
  { icon: Mail, title: 'Cover Letters', desc: 'Role-specific letters for hospital, industry, and community positions' },
  { icon: Linkedin, title: 'LinkedIn Profile', desc: 'Optimized headline, about section, and skills for maximum visibility' },
  { icon: MessageSquare, title: 'Interview Prep', desc: 'Behavioral & technical questions with model answers' },
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">Career Launch Pack</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/status">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Check Status</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 hidden md:block"
        >
          <img
            src={heroImage}
            alt="Creative pharmacist launching career"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,47%,11%)/0.85] via-[hsl(222,47%,11%)/0.7] to-transparent" />
        </motion.div>

        {/* Mobile: solid bg */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-b from-[hsl(222,47%,11%)] to-[hsl(222,47%,18%)]" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto md:mx-0">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div custom={0} variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(174,63%,40%)/0.2] border border-[hsl(174,63%,40%)/0.3] text-[hsl(174,63%,90%)] text-sm font-medium mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Powered Career Intelligence
                </span>
              </motion.div>
              <motion.h1 custom={1} variants={fadeUp} className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 text-center md:text-left">
                Launch Your
                <span className="block text-[hsl(174,63%,50%)]">Pharmacy Career</span>
              </motion.h1>
              <motion.p custom={2} variants={fadeUp} className="text-lg text-white/70 mb-8 max-w-lg text-center md:text-left mx-auto md:mx-0">
                Get your complete career pack — professional CV, cover letters, LinkedIn optimization, and interview prep — all tailored to your pharmacy profile.
              </motion.p>

              {/* Mobile hero image — between text and CTA */}
              <motion.div custom={2.5} variants={fadeUp} className="md:hidden mb-8 rounded-2xl overflow-hidden mx-auto max-w-sm">
                <img
                  src={heroImage}
                  alt="Creative pharmacist launching career"
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </motion.div>

              <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/apply">
                  <Button size="lg" className="btn-generate text-base px-8 w-full sm:w-auto">
                    Start Your Application
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/status">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Track Your Pack
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </header>

      {/* What You'll Get */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">What You'll Get</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to stand out in the competitive pharmacy job market</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">{f.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Workflow */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: 'var(--gradient-hero)' }} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From application to career-ready in four simple steps</p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-center gap-6 mb-12 last:mb-0 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`flex items-center gap-3 mb-2 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </motion.div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                    className="w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary text-sm z-10"
                  >
                    {i + 1}
                  </motion.div>
                </div>

                {/* Spacer */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link to="/apply">
              <Button size="lg" className="btn-generate text-base px-10">
                Get Started — It's Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            {[
              { icon: Shield, label: 'Secure & Private', sub: 'Your data is encrypted and protected' },
              { icon: Zap, label: 'AI-Powered', sub: 'Smart suggestions to strengthen your profile' },
              { icon: CheckCircle2, label: 'Professional Quality', sub: 'Industry-standard documents' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">{item.label}</h4>
                <p className="text-sm text-muted-foreground">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Career Launch Pack</p>
          <a
            href="https://www.instagram.com/ariishaslife?igsh=MXdpczUyaDhrZmNhYQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @ariishaslife
          </a>
        </div>
      </footer>
    </div>
  );
}
