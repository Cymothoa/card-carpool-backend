export interface Member {
  id: number;
  card_group_id: number;
  member_number: string;
  member_name: string | null;
  created_at: string;
}

export interface CreateMemberRequest {
  member_number: string;
  member_name?: string | null;
}

export interface BulkCreateMembersRequest {
  preset?: 'cortis_all';
  members?: CreateMemberRequest[];
}
