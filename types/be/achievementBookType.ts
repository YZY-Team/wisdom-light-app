/**
 * 成就书DTO
 */
export interface AchievementBookDTO {
  id?: string;
  userId?: string;
  name?: string;
  nickname?: string;
  gender?: string;
  age?: number;
  maritalStatus?: string;
  childrenStatus?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  position?: string;
  companySize?: string;
  annualIncome?: string;
  companyAddress?: string;
  emergencyContact?: string;
  homeAddress?: string;
  oath?: string;
  promise?: string;
  isActive?: boolean;
  membershipStartDate?: string;
  membershipEndDate?: string;
  coachIds?: string;
  createTime?: string;
  updateTime?: string;
}
