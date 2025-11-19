import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// Import the TiltedCard and BlurText components
import TiltedCard from '@/components/ui/TiltedCard';
import BlurText from "@/components/ui/BlurText"; 
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* 2. Apply BlurText to the main title */}
            <BlurText
              text="Agrofy Portal"
              animateBy="words"
              direction="bottom"
              delay={150} // Delay between each word appearing
              className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 justify-center"
            />
            
            {/* 3. Apply BlurText to the tagline */}
            <BlurText
              text="Digital Trade Certification for the Modern World"
              animateBy="words"
              direction="bottom"
              delay={100} 
              className="text-xl md:text-2xl text-primary-foreground/90 mb-8 justify-center"
            />
            
            {/* 4. Apply BlurText to the description */}
            <BlurText
              text="Streamline quality inspections, generate verifiable digital certificates, and prevent fraud with blockchain-inspired verification technology."
              animateBy="words"
              direction="bottom"
              delay={50} // Shorter delay for the main paragraph
              className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto justify-center"
            />
            
            {/* CTA Buttons remain static */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/login?role=exporter">Login as Exporter</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <Link to="/login?role=qa">Login as QA Agent</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <Link to="/verify">Verify Certificate</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - anchor target for navbar */}
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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. qwertyuiop asdfghjkl zxcvbnm. aaabbbcccddd eeefffggghhh iiiiiiii
            </p>
            <div className="mt-6">
              <a href="/" className="text-sm text-primary hover:underline">Back to top</a>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features Section - We can apply BlurText to the feature titles too */}
      <section className="py-20 bg-gradient-to-br from-primary via-secondary to-primary">
        <div className="container mx-auto px-4">
          <BlurText
            text="Why Choose Agrofy?"
            animateBy="words"
            direction="top"
            delay={80}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground justify-center"
          />
          {/* MODIFIED GRID LAYOUT TO ACCOMMODATE 4 CARDS ON LARGE SCREENS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 - Digital Certificates (TiltedCard with overlay text) */}
            <div className="flex flex-col items-stretch h-full">
              <div className="rounded-[15px] overflow-hidden shadow-md border border-border">
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
                    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent text-center">
                      <div>
                        <h3 className="text-lg font-semibold text-black">Digital Certificates</h3>
                        <p className="text-sm text-slate-700">Generate tamper-proof digital certificates with verifiable credentials for every shipment inspection.</p>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Feature 2 - Faster Inspections (overlay text) */}
            <div className="flex flex-col items-stretch h-full">
              <div className="rounded-[15px] overflow-hidden shadow-md border border-border">
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
                    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent text-center">
                      <div>
                        <h3 className="text-lg font-semibold text-black">Faster Inspections</h3>
                        <p className="text-sm text-slate-700">Streamline your quality assurance workflow with digital forms and automated certificate generation.</p>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Feature 3 - Fraud Prevention (overlay text) */}
            <div className="flex flex-col items-stretch h-full">
              <div className="rounded-[15px] overflow-hidden shadow-md border border-border">
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
                    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent text-center">
                      <div>
                        <h3 className="text-lg font-semibold text-black">Fraud Prevention</h3>
                        <p className="text-sm text-slate-700">Verify certificates instantly with unique IDs and digital signatures, preventing document forgery.</p>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Feature 4 - End-to-End Visibility (overlay text) */}
            <div className="flex flex-col items-stretch h-full">
              <div className="rounded-[15px] overflow-hidden shadow-md border border-border">
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
                    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent text-center">
                      <div>
                        <h3 className="text-lg font-semibold text-black">End-to-End Visibility</h3>
                        <p className="text-sm text-slate-700">Monitor the entire certification journey—from quality check initiation to final verification—all in one transparent dashboard.</p>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  {/* Apply BlurText to the subtitle */}
                  <BlurText
                    text="Exporter Request"
                    animateBy="words"
                    direction="top"
                    delay={100}
                    className="text-xl font-semibold mb-2 text-foreground"
                  />
                  <p className="text-muted-foreground">
                    Exporters create shipment records with product details and quality criteria to be verified.
                  </p>
                </div>
              </div>

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
                    Quality assurance agents conduct inspections and record results digitally with supporting documentation.
                  </p>
                </div>
              </div>

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
                    Upon passing inspection, a verifiable digital certificate is automatically generated with a unique ID.
                  </p>
                </div>
              </div>

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
                    Anyone can verify certificates instantly using the certificate ID or QR code scan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join the future of trade certification. Create your account today.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </section>
      
      {/* FAQ Section */}
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
                  Agrofy is a platform that helps manage digital trade certification. Lorem ipsum dolor sit amet, consectetur.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Why was Agrofy created?</AccordionTrigger>
                <AccordionContent>
                  It was created to streamline inspections and prevent fraud with verifiable digital certificates. lorem ipsum dolor sit.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How secure are the certificates?</AccordionTrigger>
                <AccordionContent>
                  Certificates use verification mechanisms to ensure authenticity. Placeholder answer text for now.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Who can verify a certificate?</AccordionTrigger>
                <AccordionContent>
                  Anyone with the certificate ID or QR code can verify. More descriptive content will appear here later.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How do exporters start?</AccordionTrigger>
                <AccordionContent>
                  Exporters create shipment records and request inspections through the dashboard. (Placeholder)
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>What data is required for inspection?</AccordionTrigger>
                <AccordionContent>
                  Basic shipment details, product criteria and supporting documents are needed. (Placeholder text)
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                <AccordionContent>
                  We plan mobile support; currently web interface covers the features. Placeholder answer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>Can I revoke a certificate?</AccordionTrigger>
                <AccordionContent>
                  Yes — certificates can be marked invalid if tampering is detected or records updated. (Placeholder)
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger>How are disputes handled?</AccordionTrigger>
                <AccordionContent>
                  Dispute workflows will be defined for contested inspections. Temporary placeholder text.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger>Who do I contact for support?</AccordionTrigger>
                <AccordionContent>
                  Support contact details and processes will be added here. For now this is filler content.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;