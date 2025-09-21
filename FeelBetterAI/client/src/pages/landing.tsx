import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Mic, ChartLine, Clock, ShieldQuestion, MessageSquareDashed, ChartPie, AlertTriangle } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  // If user is authenticated, don't show landing page
  if (!isLoading && isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: MessageSquareDashed,
      title: "Empathetic Conversations",
      description: "Natural, human-like conversations that validate your feelings and provide gentle support when you need it most.",
      color: "text-primary"
    },
    {
      icon: ChartPie,
      title: "Mood Tracking",
      description: "Intelligent sentiment analysis that helps you understand your emotional patterns and progress over time.",
      color: "text-accent"
    },
    {
      icon: Mic,
      title: "Voice Interaction",
      description: "Speak naturally and hear comforting responses with advanced text-to-speech and speech recognition technology.",
      color: "text-warning"
    },
    {
      icon: AlertTriangle,
      title: "Crisis Detection",
      description: "Advanced pattern recognition that identifies concerning language and provides appropriate crisis intervention resources.",
      color: "text-destructive"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Always available when you need support, with consistent and reliable AI companionship that never judges.",
      color: "text-primary"
    },
    {
      icon: ShieldQuestion,
      title: "Privacy First",
      description: "Your conversations are encrypted and secure. We prioritize your privacy while providing personalized support.",
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border" data-testid="header-landing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Feel-Better AI</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact</a>
            </nav>
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="animate-breathe"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight" data-testid="text-hero-title">
                  Your Empathetic AI Companion
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-hero-description">
                  A safe space to talk, reflect, and feel better. Our AI companion listens with empathy, tracks your mood, and provides gentle support whenever you need it.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/api/login'}
                  className="animate-breathe"
                  data-testid="button-start-journey"
                >
                  Start Your Journey
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="text-accent h-4 w-4" />
                  <span>Privacy Protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="text-accent h-4 w-4" />
                  <span>Voice Enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartLine className="text-accent h-4 w-4" />
                  <span>Mood Tracking</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Peaceful meditation scene" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-hero"
              />
              <Card className="absolute -bottom-6 -left-6 shadow-lg border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <MessageSquareDashed className="text-accent-foreground h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid="text-support-title">24/7 Support</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-support-description">Always here to listen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30" data-testid="features-section">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
              How Feel-Better AI Supports You
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
              Designed with empathy and backed by AI, our platform provides personalized support for your mental wellness journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${feature.color.split('-')[1]}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`${feature.color} h-6 w-6`} />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
