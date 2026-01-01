import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TiltedCard from '@/components/ui/TiltedCard';
import BlurText from "@/components/ui/BlurText";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Instagram, Phone, MessageCircle, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden py-20 md:py-32"
        style={{
          backgroundImage:
            "url('/images/hero-field.jpg'), url('/images/corn.jpg'), linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center, center, center",
        }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" aria-hidden="true" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center relative z-10">

            <BlurText
              text="Agrofy Portal"
              animateBy="words"
              direction="bottom"
              delay={150}
              className="text-4xl md:text-6xl font-bold mb-6 justify-center text-primary-foreground drop-shadow-lg"
            />

            <BlurText
              text="Digital Trade Certification for the Modern World"
              animateBy="words"
              direction="bottom"
              delay={100}
              className="text-xl md:text-2xl mb-8 justify-center text-primary-foreground/95"
            />

            <BlurText
              text="Streamline quality inspections, generate verifiable digital certificates, and prevent fraud with blockchain-inspired verification technology."
              animateBy="words"
              direction="bottom"
              delay={50}
              className="text-lg mb-10 max-w-2xl mx-auto justify-center text-primary-foreground/85"
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <Link to="/login?role=exporter">Login as Exporter</Link>
              </Button>

              <Button asChild size="lg" variant="outline"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <Link to="/login?role=qa">Login as QA Agent</Link>
              </Button>

              <Button asChild size="lg" variant="outline"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <Link to="/verify">Verify Certificate</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <BlurText
              text="About Us"
              animateBy="words"
              direction="top"
              delay={80}
              className="text-3xl md:text-4xl font-bold mb-6 text-foreground justify-center"
            />
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Agrofy is a digital verification platform designed to bring trust, transparency, and traceability to the agricultural export ecosystem. We enable exporters, quality assurance agencies, and importers to collaborate on a single platform for product inspection, certification, and verification.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              In global agri-trade, the credibility of quality certificates is critical. Traditional paper-based certificates are often slow, difficult to verify, and vulnerable to tampering. Agrofy solves this problem by issuing secure, verifiable digital certificates backed by modern cryptographic standards.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Our platform allows exporters to upload product and batch details, QA agencies to conduct and log inspections, and approved products to receive Verifiable Digital Certificates (Digital Product Passports). These certificates can be instantly verified by importers and authorities using QR-based verification via Inji Verify, ensuring authenticity and eliminating fraud.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
              Agrofy is built on open digital identity standards, enabling tamper-proof, privacy-preserving, and globally verifiable credentials. By combining inspection workflows with verifiable credentials, Agrofy helps businesses reduce compliance friction, accelerate exports, and build trust across borders.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our mission is to create a trusted digital infrastructure for agri-exports, where every verified product carries a proof of quality that can be instantly validated—anytime, anywhere.
            </p>
            <div className="mt-6">
              <a href="/" className="text-sm text-primary hover:underline">Back to top</a>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage:
            "url('/images/hero-field.jpg'), linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">

          <BlurText
            text="Why Choose Agrofy?"
            animateBy="words"
            direction="top"
            delay={80}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground justify-center"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">

            {/* CARD 1 */}
            <div className="rounded-[15px] overflow-hidden shadow-md border border-slate-200">
              <TiltedCard
                imageSrc="/images/irrigation.jpg"
                altText="Digital Certificates"
                captionText="Digital Certificates"
                containerHeight="240px"
                imageWidth="100%"
                imageHeight="240px"
                scaleOnHover={1.06}
                rotateAmplitude={10}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                    <div className="relative z-10 text-center px-4 max-w-xs md:max-w-sm">
                      <h3 className="text-xl font-bold text-primary-foreground drop-shadow-lg">Digital Certificates</h3>
                      <p className="text-sm text-primary-foreground/90 drop-shadow">
                        Generate tamper-proof digital certificates with verifiable credentials.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>

            {/* CARD 2 */}
            <div className="rounded-[15px] overflow-hidden shadow-md border border-slate-200">
              <TiltedCard
                imageSrc="/images/rows.jpg"
                altText="Faster Inspections"
                captionText="Faster Inspections"
                containerHeight="240px"
                imageWidth="100%"
                imageHeight="240px"
                scaleOnHover={1.06}
                rotateAmplitude={10}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                    <div className="relative z-10 text-center px-4 max-w-xs md:max-w-sm">
                      <h3 className="text-xl font-bold text-primary-foreground drop-shadow-lg">Faster Inspections</h3>
                      <p className="text-sm text-primary-foreground/90 drop-shadow">
                        Streamline QA workflow with digital forms and automation.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>

            {/* CARD 3 */}
            <div className="rounded-[15px] overflow-hidden shadow-md border border-slate-200">
              <TiltedCard
                imageSrc="/images/corn.jpg"
                altText="Fraud Prevention"
                captionText="Fraud Prevention"
                containerHeight="240px"
                imageWidth="100%"
                imageHeight="240px"
                scaleOnHover={1.06}
                rotateAmplitude={10}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                    <div className="relative z-10 text-center px-4 max-w-xs md:max-w-sm">
                      <h3 className="text-xl font-bold text-primary-foreground drop-shadow-lg">Fraud Prevention</h3>
                      <p className="text-sm text-primary-foreground/90 drop-shadow">
                        Prevent forgery with digital signatures & verification.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>

            {/* CARD 4 */}
            <div className="rounded-[15px] overflow-hidden shadow-md border border-slate-200">
              <TiltedCard
                imageSrc="/images/drone.jpg"
                altText="End-to-End Visibility"
                captionText="End-to-End Visibility"
                containerHeight="240px"
                imageWidth="100%"
                imageHeight="240px"
                scaleOnHover={1.06}
                rotateAmplitude={10}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
                    <div className="relative z-10 text-center px-4 max-w-xs md:max-w-sm">
                      <h3 className="text-xl font-bold text-primary-foreground drop-shadow-lg">End-to-End Visibility</h3>
                      <p className="text-sm text-primary-foreground/90 drop-shadow">
                        Monitor certification from inspection to verification.
                      </p>
                    </div>
                  </div>
                }
              />
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">

            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <BlurText
                  text="Exporter Request"
                  animateBy="words"
                  direction="top"
                  delay={100}
                  className="text-xl font-semibold mb-2 text-foreground"
                />
                <p className="text-muted-foreground">
                  Exporters create shipment records with product details & criteria.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <BlurText
                  text="QA Inspection"
                  animateBy="words"
                  direction="top"
                  delay={100}
                  className="text-xl font-semibold mb-2 text-foreground"
                />
                <p className="text-muted-foreground">
                  QA agents inspect shipments and upload results digitally.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <BlurText
                  text="Certificate Issued"
                  animateBy="words"
                  direction="top"
                  delay={100}
                  className="text-xl font-semibold mb-2 text-foreground"
                />
                <p className="text-muted-foreground">
                  A verifiable digital certificate is generated with a unique ID.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <BlurText
                  text="Verifier"
                  animateBy="words"
                  direction="top"
                  delay={100}
                  className="text-xl font-semibold mb-2 text-foreground"
                />
                <p className="text-muted-foreground">
                  Anyone can verify certificates using the ID or QR code.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join the future of trade certification. Create your account today.
          </p>

          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="py-20 bg-background">
        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">
            <BlurText
              text="Frequently Asked Questions"
              animateBy="words"
              direction="top"
              delay={80}
              className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground justify-center"
            />

            <Accordion type="single" collapsible className="space-y-4">

              <AccordionItem value="item-1">
                <AccordionTrigger>What is Agrofy?</AccordionTrigger>
                <AccordionContent>
                  Agrofy is a platform that helps manage digital trade certification.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Why was Agrofy created?</AccordionTrigger>
                <AccordionContent>
                  It streamlines inspections and prevents fraud with verifiable certificates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How secure are the certificates?</AccordionTrigger>
                <AccordionContent>
                  Certificates use verification mechanisms to ensure authenticity.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Who can verify a certificate?</AccordionTrigger>
                <AccordionContent>
                  Anyone with the certificate ID or QR code.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How do exporters start?</AccordionTrigger>
                <AccordionContent>
                  By creating shipment records and requesting inspections.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>What data is required?</AccordionTrigger>
                <AccordionContent>
                  Shipment details, product criteria, and supporting documents.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                <AccordionContent>
                  Mobile support is planned; web interface works today.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>Can I revoke a certificate?</AccordionTrigger>
                <AccordionContent>
                  Yes — certificates can be marked invalid if tampering is detected.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger>How are disputes handled?</AccordionTrigger>
                <AccordionContent>
                  Dispute workflows will handle contested inspections.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger>Who do I contact for support?</AccordionTrigger>
                <AccordionContent>
                  Support contact details will be added here.
                </AccordionContent>
              </AccordionItem>

            </Accordion>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="footer" className="py-12 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-primary-foreground">

            <div className="grid md:grid-cols-2 gap-8 items-center">

              <div className="text-center md:text-left">
                <h3 className="text-2xl font-semibold mb-4 text-primary-foreground">Contact Us</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Phone className="w-5 h-5" /> <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <MessageCircle className="w-5 h-5" /> <span>+1 (555) 987-6543 (WhatsApp)</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Mail className="w-5 h-5" /> <span>support@agrofy.example</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <MapPin className="w-5 h-5" /> <span>123 Farm Road, AgroCity</span>
                  </div>
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="flex justify-center md:justify-end gap-4">
                  <a href="#" className="p-3 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">
                    <Instagram className="w-5 h-5 text-primary-foreground" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20">
                    <Phone className="w-5 h-5 text-primary-foreground" />
                  </a>
                </div>
              </div>

            </div>

            <div className="mt-8 text-center text-sm text-primary-foreground/80">
              © {new Date().getFullYear()} Agrofy Portal. All rights reserved.
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
