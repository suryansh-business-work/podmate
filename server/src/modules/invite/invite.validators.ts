interface ContactInput {
  phone: string;
  name: string;
}

export function validateInviteContacts(contacts: ContactInput[]): ContactInput[] {
  if (!contacts || contacts.length === 0) {
    throw new Error('At least one contact is required');
  }
  if (contacts.length > 50) {
    throw new Error('Cannot invite more than 50 contacts at once');
  }

  return contacts.map((c) => {
    const phone = c.phone.replace(/[^\d+]/g, '');
    if (phone.length < 10) {
      throw new Error(`Invalid phone number for ${c.name || 'contact'}`);
    }
    return {
      phone,
      name: (c.name || 'Friend').trim().slice(0, 100),
    };
  });
}
