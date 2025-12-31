export interface User {
    id: number;
    username: string;
    display_name: string;
    user_type: 'owner' | 'member';
    created_at: string;
    updated_at: string;
}
export interface CreateUserRequest {
    username: string;
    display_name: string;
    user_type?: 'owner' | 'member';
}
export interface UpdateUserRequest {
    display_name?: string;
    user_type?: 'owner' | 'member';
}
//# sourceMappingURL=User.d.ts.map