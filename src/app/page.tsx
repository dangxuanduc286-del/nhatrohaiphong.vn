import { CtaSection, StickyCta } from "@/components/home/cta-section";
import { DistrictSection } from "@/components/home/district-section";
import { FeaturedRoomsSection } from "@/components/home/featured-rooms-section";
import { HeroSection } from "@/components/home/hero-section";
import { LandingSection } from "@/components/home/landing-section";
import { NearbyRoomsSection } from "@/components/home/nearby-rooms-section";
import { PoiSection } from "@/components/home/poi-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { StatsSection } from "@/components/home/stats-section";
import { getHomeData, getPostRoomCta, getViewerRole } from "@/components/home/data";

export const revalidate = 300;

export default async function Home() {
  const { landingPages, districts, pois, featuredRooms, roomCount, landlordCount, districtCount } =
    await getHomeData();
  const viewerRole = await getViewerRole();
  const postRoomCta = getPostRoomCta(viewerRole);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <SiteHeader postRoomCta={postRoomCta} />
      <HeroSection postRoomCta={postRoomCta} />
      <StatsSection
        roomCount={roomCount}
        landlordCount={landlordCount}
        districtCount={districtCount}
      />
      <FeaturedRoomsSection rooms={featuredRooms} />
      <NearbyRoomsSection />
      <DistrictSection districts={districts} />
      <PoiSection pois={pois} />
      <LandingSection landingPages={landingPages} />
      <CtaSection postRoomCta={postRoomCta} />
      <StickyCta postRoomCta={postRoomCta} />
      <SiteFooter postRoomCta={postRoomCta} districts={districts} />
    </main>
  );
}
