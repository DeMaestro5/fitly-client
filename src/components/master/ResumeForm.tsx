import type { ReactNode } from 'react';
import type { MasterResume } from '../../api/types';
import { newId } from '../../lib/master-draft';
import { AutoTextarea } from '../AutoTextarea';
import { AddButton, Card, ChipEditor, Field, IconButton } from './ui';

export type Edit = (change: (draft: MasterResume) => void) => void;

const DATE_HINT = 'YYYY-MM';

export function ResumeForm({
  draft,
  edit,
}: {
  draft: MasterResume;
  edit: Edit;
}) {
  const { locked, tailorable } = draft;

  // Bullets and descriptions live in `tailorable`, keyed by the locked item's id.
  const bulletsOf = (id: string) =>
    tailorable.experience.find((entry) => entry.id === id)?.bullets ?? [];
  const descriptionOf = (id: string) =>
    tailorable.projects.find((entry) => entry.id === id)?.description ?? '';

  function bulletList(next: MasterResume, id: string) {
    let entry = next.tailorable.experience.find((item) => item.id === id);
    if (!entry) {
      entry = { id, bullets: [] };
      next.tailorable.experience.push(entry);
    }
    return entry.bullets;
  }

  function projectEntry(next: MasterResume, id: string) {
    let entry = next.tailorable.projects.find((item) => item.id === id);
    if (!entry) {
      entry = { id, description: '' };
      next.tailorable.projects.push(entry);
    }
    return entry;
  }

  return (
    <div className='space-y-5'>
      <Card title='Contact'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <Field
            label='Full name'
            value={locked.basics.fullName}
            onChange={(e) =>
              edit((d) => void (d.locked.basics.fullName = e.target.value))
            }
          />
          <Field
            label='Email'
            type='email'
            value={locked.basics.email}
            onChange={(e) =>
              edit((d) => void (d.locked.basics.email = e.target.value))
            }
          />
          <Field
            label='Phone'
            value={locked.basics.phone}
            onChange={(e) =>
              edit((d) => void (d.locked.basics.phone = e.target.value))
            }
          />
          <Field
            label='Location'
            value={locked.basics.location}
            onChange={(e) =>
              edit((d) => void (d.locked.basics.location = e.target.value))
            }
          />
        </div>
      </Card>

      <Card title='Links' hint='Full addresses, starting with https://'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <Field
            label='GitHub'
            value={locked.links.github}
            onChange={(e) =>
              edit((d) => void (d.locked.links.github = e.target.value))
            }
          />
          <Field
            label='LinkedIn'
            value={locked.links.linkedin}
            onChange={(e) =>
              edit((d) => void (d.locked.links.linkedin = e.target.value))
            }
          />
          <Field
            label='Portfolio'
            className='sm:col-span-2'
            value={locked.links.portfolio}
            onChange={(e) =>
              edit((d) => void (d.locked.links.portfolio = e.target.value))
            }
          />
        </div>
        <Rows
          rows={locked.links.other ?? []}
          fields={[
            { key: 'label', label: 'Label' },
            { key: 'url', label: 'Link' },
          ]}
          onChange={(rows) => edit((d) => void (d.locked.links.other = rows))}
          blank={{ label: '', url: '' }}
          addLabel='Add another link'
        />
      </Card>

      <Card title='Headline and summary'>
        <div className='space-y-3'>
          <Field
            label='Headline'
            value={tailorable.headline ?? ''}
            onChange={(e) =>
              edit((d) => void (d.tailorable.headline = e.target.value))
            }
          />
          <label className='block'>
            <span className='mb-1 block text-xs font-medium text-muted'>
              Summary
            </span>
            <AutoTextarea
              value={tailorable.summary ?? ''}
              onChange={(e) =>
                edit((d) => void (d.tailorable.summary = e.target.value))
              }
            />
          </label>
        </div>
      </Card>

      <Card title='Experience'>
        <div className='space-y-5'>
          {locked.experience.map((role, index) => (
            <Block
              key={role.id}
              title={role.title || role.company || `Role ${index + 1}`}
              onRemove={() =>
                edit((d) => {
                  d.locked.experience = d.locked.experience.filter(
                    (item) => item.id !== role.id
                  );
                  d.tailorable.experience = d.tailorable.experience.filter(
                    (item) => item.id !== role.id
                  );
                })
              }
            >
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='Job title'
                  value={role.title}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.experience[index].title = e.target.value)
                    )
                  }
                />
                <Field
                  label='Company'
                  value={role.company}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.experience[index].company =
                          e.target.value)
                    )
                  }
                />
                <Field
                  label='Location'
                  value={role.location}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.experience[index].location =
                          e.target.value)
                    )
                  }
                />
                <div className='grid grid-cols-2 gap-3'>
                  <Field
                    label='Start'
                    placeholder={DATE_HINT}
                    value={role.startDate}
                    onChange={(e) =>
                      edit(
                        (d) =>
                          void (d.locked.experience[index].startDate =
                            e.target.value)
                      )
                    }
                  />
                  <Field
                    label='End'
                    placeholder={`${DATE_HINT} or present`}
                    value={role.endDate}
                    onChange={(e) =>
                      edit(
                        (d) =>
                          void (d.locked.experience[index].endDate =
                            e.target.value)
                      )
                    }
                  />
                </div>
                <Field
                  label='One-line description (optional)'
                  className='sm:col-span-2'
                  value={role.tagline ?? ''}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.experience[index].tagline =
                          e.target.value)
                    )
                  }
                />
              </div>

              <ul className='mt-4 space-y-2'>
                {bulletsOf(role.id).map((bullet, bulletIndex) => (
                  <li key={bullet.id} className='flex items-start gap-2'>
                    <span
                      aria-hidden='true'
                      className='mt-[1.05rem] size-1.5 shrink-0 rounded-full bg-ink/40'
                    />
                    <AutoTextarea
                      value={bullet.text}
                      aria-label={`${role.company || 'Role'} bullet ${
                        bulletIndex + 1
                      }`}
                      onChange={(e) =>
                        edit(
                          (d) =>
                            void (bulletList(d, role.id)[bulletIndex].text =
                              e.target.value)
                        )
                      }
                    />
                    <IconButton
                      label={`Remove bullet ${bulletIndex + 1}`}
                      className='mt-1'
                      onClick={() =>
                        edit(
                          (d) =>
                            void bulletList(d, role.id).splice(bulletIndex, 1)
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
              <AddButton
                onClick={() =>
                  edit(
                    (d) =>
                      void bulletList(d, role.id).push({
                        id: newId('b'),
                        text: '',
                      })
                  )
                }
              >
                Add bullet
              </AddButton>
            </Block>
          ))}
        </div>
        <AddButton
          onClick={() =>
            edit((d) => {
              const id = newId('e');
              d.locked.experience.push({
                id,
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
              });
              d.tailorable.experience.push({
                id,
                bullets: [{ id: newId('b'), text: '' }],
              });
            })
          }
        >
          Add role
        </AddButton>
      </Card>

      <Card title='Projects'>
        <div className='space-y-5'>
          {locked.projects.map((project, index) => (
            <Block
              key={project.id}
              title={project.name || `Project ${index + 1}`}
              onRemove={() =>
                edit((d) => {
                  d.locked.projects = d.locked.projects.filter(
                    (item) => item.id !== project.id
                  );
                  d.tailorable.projects = d.tailorable.projects.filter(
                    (item) => item.id !== project.id
                  );
                })
              }
            >
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='Name'
                  value={project.name}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.projects[index].name = e.target.value)
                    )
                  }
                />
                <Field
                  label='Link (optional)'
                  value={project.url ?? ''}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.projects[index].url = e.target.value)
                    )
                  }
                />
              </div>
              <p className='mb-1 mt-3 text-xs font-medium text-muted'>
                Technologies
              </p>
              <ChipEditor
                label={`${project.name || 'Project'} technologies`}
                items={project.technologies}
                placeholder='Add tech'
                onChange={(items) =>
                  edit(
                    (d) => void (d.locked.projects[index].technologies = items)
                  )
                }
              />
              <label className='mt-3 block'>
                <span className='mb-1 block text-xs font-medium text-muted'>
                  Description
                </span>
                <AutoTextarea
                  value={descriptionOf(project.id)}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (projectEntry(d, project.id).description =
                          e.target.value)
                    )
                  }
                />
              </label>
            </Block>
          ))}
        </div>
        <AddButton
          onClick={() =>
            edit((d) => {
              const id = newId('p');
              d.locked.projects.push({ id, name: '', technologies: [] });
              d.tailorable.projects.push({ id, description: '' });
            })
          }
        >
          Add project
        </AddButton>
      </Card>

      <Card title='Education'>
        <div className='space-y-5'>
          {locked.education.map((item, index) => (
            <Block
              key={index}
              title={item.institution || `School ${index + 1}`}
              onRemove={() =>
                edit((d) => void d.locked.education.splice(index, 1))
              }
            >
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field
                  label='School'
                  value={item.institution}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.education[index].institution =
                          e.target.value)
                    )
                  }
                />
                <Field
                  label='Field of study'
                  value={item.area}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.education[index].area = e.target.value)
                    )
                  }
                />
                <Field
                  label='Qualification (optional)'
                  value={item.qualification ?? ''}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.education[index].qualification =
                          e.target.value)
                    )
                  }
                />
                <Field
                  label='Location (optional)'
                  value={item.location ?? ''}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.education[index].location =
                          e.target.value)
                    )
                  }
                />
                <Field
                  label='Finished'
                  placeholder='YYYY'
                  value={item.endDate}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.locked.education[index].endDate =
                          e.target.value)
                    )
                  }
                />
              </div>
            </Block>
          ))}
        </div>
        <AddButton
          onClick={() =>
            edit(
              (d) =>
                void d.locked.education.push({
                  institution: '',
                  area: '',
                  endDate: '',
                })
            )
          }
        >
          Add school
        </AddButton>
      </Card>

      <Card title='Skills' hint='Press Enter or comma to add a skill.'>
        <div className='space-y-5'>
          {tailorable.skills.map((group, index) => (
            <div key={group.id}>
              <div className='flex items-end gap-2'>
                <Field
                  label='Group'
                  className='flex-1'
                  value={group.group}
                  onChange={(e) =>
                    edit(
                      (d) =>
                        void (d.tailorable.skills[index].group = e.target.value)
                    )
                  }
                />
                <IconButton
                  label={`Remove group ${group.group || index + 1}`}
                  className='mb-1'
                  onClick={() =>
                    edit((d) => void d.tailorable.skills.splice(index, 1))
                  }
                />
              </div>
              <div className='mt-3'>
                <ChipEditor
                  label={`${group.group || 'Group'} skills`}
                  items={group.items}
                  placeholder='Add skill'
                  onChange={(items) =>
                    edit((d) => void (d.tailorable.skills[index].items = items))
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <AddButton
          onClick={() =>
            edit(
              (d) =>
                void d.tailorable.skills.push({
                  id: newId('s'),
                  group: '',
                  items: [],
                })
            )
          }
        >
          Add group
        </AddButton>
      </Card>

      <Card title='More' hint='Optional sections.'>
        <div className='space-y-6'>
          <div>
            <p className='mb-2 text-xs font-medium text-muted'>Hobbies</p>
            <ChipEditor
              label='Hobbies'
              items={locked.hobbies ?? []}
              placeholder='Add hobby'
              onChange={(items) => edit((d) => void (d.locked.hobbies = items))}
            />
          </div>
          <div>
            <p className='text-xs font-medium text-muted'>Certifications</p>
            <Rows
              rows={locked.certifications ?? []}
              fields={[
                { key: 'name', label: 'Name' },
                { key: 'issuer', label: 'Issuer' },
                { key: 'date', label: 'Date', placeholder: DATE_HINT },
                { key: 'url', label: 'Link' },
              ]}
              blank={{ name: '' }}
              addLabel='Add certification'
              onChange={(rows) =>
                edit((d) => void (d.locked.certifications = rows))
              }
            />
          </div>
          <div>
            <p className='text-xs font-medium text-muted'>Languages</p>
            <Rows
              rows={locked.languages ?? []}
              fields={[
                { key: 'language', label: 'Language' },
                { key: 'proficiency', label: 'Level' },
              ]}
              blank={{ language: '' }}
              addLabel='Add language'
              onChange={(rows) => edit((d) => void (d.locked.languages = rows))}
            />
          </div>
          <div>
            <p className='text-xs font-medium text-muted'>Awards</p>
            <Rows
              rows={locked.awards ?? []}
              fields={[
                { key: 'title', label: 'Title' },
                { key: 'issuer', label: 'Issuer' },
                { key: 'date', label: 'Date', placeholder: DATE_HINT },
              ]}
              blank={{ title: '' }}
              addLabel='Add award'
              onChange={(rows) => edit((d) => void (d.locked.awards = rows))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Block({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className='rounded-md bg-white/70 p-4 ring-1 ring-black/[0.06]'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h3 className='min-w-0 truncate text-sm font-semibold'>{title}</h3>
        <IconButton label={`Remove ${title}`} onClick={onRemove} />
      </div>
      {children}
    </div>
  );
}

/** Repeating rows of short text fields (links, certifications, languages, awards). */
function Rows<T extends object>({
  rows,
  fields,
  blank,
  addLabel,
  onChange,
}: {
  rows: T[];
  fields: { key: keyof T & string; label: string; placeholder?: string }[];
  blank: T;
  addLabel: string;
  onChange: (rows: T[]) => void;
}) {
  return (
    <div>
      <div className='mt-2 space-y-3'>
        {rows.map((row, index) => (
          <div key={index} className='flex items-end gap-2'>
            <div className='grid flex-1 gap-3 sm:grid-cols-2'>
              {fields.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={(row[field.key] as string | undefined) ?? ''}
                  onChange={(e) =>
                    onChange(
                      rows.map((item, i) =>
                        i === index
                          ? { ...item, [field.key]: e.target.value }
                          : item
                      )
                    )
                  }
                />
              ))}
            </div>
            <IconButton
              label={`Remove ${addLabel.replace(/^Add /, '')}`}
              className='mb-1'
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <AddButton onClick={() => onChange([...rows, { ...blank }])}>
        {addLabel}
      </AddButton>
    </div>
  );
}
