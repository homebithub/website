import { householdMemberService } from '~/services/grpc/authServices';
import profileSetupService from '~/services/grpc/profileSetup.service';

type SupportedProfileType = 'household' | 'househelp';

function isSupportedProfileType(profileType: string): profileType is SupportedProfileType {
  return profileType === 'household' || profileType === 'househelp';
}

function isProfileSetupNotFoundError(error: any): boolean {
  return error?.code === 5 ||
    error?.status === 5 ||
    error?.code === 'NOT_FOUND' ||
    error?.message?.includes('not found') ||
    error?.message?.includes('NOT_FOUND');
}

async function resolveHouseholdStartDestination(): Promise<string> {
  try {
    const joinRequestData = await householdMemberService.getJoinRequestStatus('');
    const request = joinRequestData?.data || joinRequestData;

    if (request?.status === 'pending') {
      return '/pending-approval';
    }

    if (request?.status === 'approved') {
      return '/household/profile';
    }
  } catch {
    // Fall back to the household chooser when the join request status is unavailable.
  }

  return '/household-choice';
}

export async function resolveProfileSetupDestination(options: {
  userId?: string;
  profileType: string;
  completedPath?: string;
}): Promise<string> {
  const { userId = '', profileType, completedPath = '/' } = options;

  if (!isSupportedProfileType(profileType)) {
    return completedPath;
  }

  try {
    const progressData = await profileSetupService.getProgress(userId, profileType);
    const totalSteps = Number(progressData?.total_steps || 0);
    const lastStep = Number(progressData?.last_completed_step || 0);
    const status = String(progressData?.status || '');
    const isComplete = status === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

    if (isComplete) {
      return completedPath;
    }

    if (profileType === 'household' && lastStep === 0) {
      return resolveHouseholdStartDestination();
    }

    return profileType === 'household'
      ? `/profile-setup/household?step=${lastStep + 1}`
      : `/profile-setup/househelp?step=${lastStep + 1}`;
  } catch (error) {
    if (isProfileSetupNotFoundError(error)) {
      if (profileType === 'household') {
        return resolveHouseholdStartDestination();
      }

      return '/profile-setup/househelp?step=1';
    }

    throw error;
  }
}
