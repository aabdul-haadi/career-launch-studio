import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill, FileText, Brain, Sparkles, ArrowRight, CheckCircle2, Search } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground">
              Career Launch Pack
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/status">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
              Launch Your Pharmacy Career
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              AI-powered career pack generator for pharmacy graduates. Get your professional CV, 
              cover letters, LinkedIn optimization, and interview prep - all tailored to your profile.
            </p>
            <Link to="/apply">
              <Button size="lg" className="btn-generate text-lg px-8">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: 'Professional CV',
                description: 'ATS-optimized resume tailored for pharmacy roles',
              },
              {
                icon: FileText,
                title: 'Cover Letters',
                description: 'Role-specific letters for hospital, industry, and community positions',
              },
              {
                icon: Sparkles,
                title: 'LinkedIn Profile',
                description: 'Optimized headline, about section, and skills for maximum visibility',
              },
              {
                icon: Brain,
                title: 'Interview Prep',
                description: 'Behavioral and technical questions with suggested answers',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-teal mb-2" />
                    <CardTitle className="font-serif">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto">
            {[
              { step: 1, title: 'Fill Your Profile', description: 'Complete the form with your education, experience, and career goals' },
              { step: 2, title: 'Get AI Coaching', description: 'Our AI assistant helps you craft compelling descriptions' },
              { step: 3, title: 'Submit & Wait', description: 'Your application is reviewed by our team' },
              { step: 4, title: 'Receive Your Pack', description: 'Get your complete career pack ready to use' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="flex items-start gap-4 mb-8"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/apply">
              <Button size="lg" className="btn-generate">
                Start Now - It's Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Career Launch Pack. Pharmacy Final Year Career Intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
