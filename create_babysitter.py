from account.models import User, UserProfile

# Create babysitter user
babysitter = User.objects.filter(email='babysitter@gmail.com').first()
if not babysitter:
    babysitter = User.objects.create_user(
        email='babysitter@gmail.com',
        password='babysitter123',
        first_name='Sarah',
        last_name='Johnson',
        phone_number='555-1234',
        role='BABYSITTER'
    )
    profile = UserProfile.objects.create(
        user=babysitter,
        bio='Experienced babysitter with 5+ years of childcare experience. CPR certified and great with kids of all ages! Love arts, crafts, and outdoor activities.',
        address='Los Angeles, CA'
    )
    print(f'✓ Created babysitter: {babysitter.email}')
    print(f'  Password: babysitter123')
else:
    print(f'✓ Babysitter already exists: {babysitter.email}')
    # Update profile if exists
    profile, created = UserProfile.objects.get_or_create(user=babysitter)
    if not profile.bio:
        profile.bio = 'Experienced babysitter with 5+ years of childcare experience. CPR certified and great with kids of all ages! Love arts, crafts, and outdoor activities.'
        profile.address = 'Los Angeles, CA'
        profile.save()
        print(f'  Updated profile')

# Create another babysitter
babysitter2 = User.objects.filter(email='babysitter2@gmail.com').first()
if not babysitter2:
    babysitter2 = User.objects.create_user(
        email='babysitter2@gmail.com',
        password='babysitter123',
        first_name='Michael',
        last_name='Brown',
        phone_number='555-5678',
        role='BABYSITTER'
    )
    profile2 = UserProfile.objects.create(
        user=babysitter2,
        bio='Friendly and reliable babysitter. Former teacher with 3 years experience. Enjoy reading, music, and educational games with children.',
        address='San Diego, CA'
    )
    print(f'✓ Created babysitter: {babysitter2.email}')
    print(f'  Password: babysitter123')
else:
    print(f'✓ Babysitter already exists: {babysitter2.email}')
