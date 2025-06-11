import Container from '../ui/container';
import { Wrapper } from '../ui/wrapper';
import { RecentClinicsList } from './recent-clinics-list';

export function RecentClinics() {
  return (
    <Wrapper>
      <Container>
        <div className="mb-10 flex flex-col gap-2 text-center md:mb-12">
          <span className="text-base font-semibold uppercase text-red-500">Recent Clinics</span>
          <h2 className="text-balance text-3xl font-black">
            Explore the latest dental clinics in Malaysia
          </h2>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            We&apos;ve compiled a list of the latest dental clinics in Malaysia.
          </p>
        </div>
        <RecentClinicsList />
      </Container>
    </Wrapper>
  );
}
